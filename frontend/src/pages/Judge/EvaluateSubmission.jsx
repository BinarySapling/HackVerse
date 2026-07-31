import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../config/axios';
import { evaluationSchema } from '../../validations/evaluation';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiData, getApiList } from '../../utils/apiResponse';
import {
  buildScoreFieldsFromCriteria,
  computeRawTotal,
  computeWeightedTotal,
  DEFAULT_SCORE_FIELDS,
  hasWeightedCriteria,
} from '../../utils/judgingCriteria';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const resolveHackathonForSubmission = async (submissionId, existingEvaluation, userId) => {
  if (existingEvaluation?.hackathon) {
    const hackathonId = existingEvaluation.hackathon._id || existingEvaluation.hackathon;
    const response = await api.get(`/hackathons/${hackathonId}`);
    return getApiData(response);
  }

  const response = await api.get('/hackathons');
  const assigned = getApiList(response).filter(
    (hackathon) => hackathon.judges?.some((judge) => (judge._id || judge) === userId)
  );

  for (const hackathon of assigned) {
    try {
      const subRes = await api.get(`/hackathons/${hackathon._id}/judge-submissions`);
      const submissions = getApiList(subRes);
      if (submissions.some((submission) => submission._id === submissionId)) {
        const detailRes = await api.get(`/hackathons/${hackathon._id}`);
        return getApiData(detailRes);
      }
    } catch {
      // Judge may not have access to this hackathon's submissions.
    }
  }

  return null;
};

const EvaluateSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [hackathon, setHackathon] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      innovationScore: 0,
      uiuxScore: 0,
      technicalScore: 0,
      presentationScore: 0,
      codeQualityScore: 0,
      problemSolvingScore: 0,
      remarks: '',
    },
  });

  const scoreFields = useMemo(
    () => buildScoreFieldsFromCriteria(hackathon?.judgingCriteria),
    [hackathon?.judgingCriteria]
  );
  const hiddenScoreFields = useMemo(
    () => DEFAULT_SCORE_FIELDS.filter((field) => !scoreFields.some((shown) => shown.id === field.id)),
    [scoreFields]
  );

  const values = watch();
  const rawTotal = computeRawTotal(scoreFields, values);
  const weightedTotal = computeWeightedTotal(scoreFields, values);
  const showWeightedTotal = hasWeightedCriteria(scoreFields);
  const maxRawTotal = scoreFields.length * 10;

  useEffect(() => {
    const fetchExisting = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/evaluations/me');
        const list = getApiList(response);
        const match = list.find(
          (evaluation) =>
            evaluation.submission?._id === submissionId || evaluation.submission === submissionId
        );

        if (match) {
          setExistingEvaluation(match);
          setValue('remarks', match.remarks);
        }

        const hackathonData = await resolveHackathonForSubmission(submissionId, match, user?.id);
        setHackathon(hackathonData);
      } catch (err) {
        console.error('Failed to load evaluation context:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [submissionId, setValue, user?.id]);

  useEffect(() => {
    if (!existingEvaluation) return;
    DEFAULT_SCORE_FIELDS.forEach((field) => {
      setValue(field.id, existingEvaluation[field.id] ?? 0);
    });
  }, [existingEvaluation, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (existingEvaluation) {
        await api.patch(`/evaluations/${existingEvaluation._id}`, data);
        toast.success('Evaluation updated successfully!');
      } else {
        await api.post(`/submissions/${submissionId}/evaluate`, data);
        toast.success('Evaluation submitted successfully!');
      }
      navigate('/dashboard/judge');
    } catch (err) {
      toast.error(err.message || 'Failed to submit score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader size="lg" />;

  return (
    <div className="relative flex flex-col gap-8 max-w-3xl">
      <Link
        to="/judge/hackathons"
        className="text-muted hover:text-primary-soft flex items-center gap-1.5 text-xs transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to assigned events
      </Link>

      <div>
        <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-3 font-medium">
          Scoring
        </p>
        <h1 className="text-3xl font-display font-semibold tracking-tight">
          {existingEvaluation ? 'Update evaluation' : 'Score submission'}
        </h1>
        <p className="text-sm text-muted mt-2">
          {hackathon?.judgingCriteria?.length
            ? `Score each rubric criterion for ${hackathon.title} from 0 to 10.`
            : 'Score each criterion from 0 to 10. Total updates automatically.'}
        </p>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] p-5 sm:p-6 text-xs text-muted flex justify-between items-center gap-4">
        <div>
          <span className="text-[11px] tracking-[0.14em] uppercase text-muted/80">Submission</span>
          <div className="font-mono text-secondary/90 mt-1 break-all">{submissionId}</div>
          {hackathon?.title && (
            <div className="text-sm text-secondary/80 mt-2">{hackathon.title}</div>
          )}
        </div>
        <div className="text-right shrink-0">
          {showWeightedTotal ? (
            <>
              <div className="text-[11px] tracking-[0.14em] uppercase text-muted/80">Weighted</div>
              <div className="text-2xl font-display font-semibold text-primary-soft tabular-nums mt-0.5">
                {weightedTotal}
                <span className="text-muted text-base font-medium"> / 10</span>
              </div>
              <div className="text-[10px] text-muted/70 mt-1 tabular-nums">
                Raw {rawTotal} / {maxRawTotal}
              </div>
            </>
          ) : (
            <>
              <div className="text-[11px] tracking-[0.14em] uppercase text-muted/80">Total</div>
              <div className="text-2xl font-display font-semibold text-primary-soft tabular-nums mt-0.5">
                {rawTotal}
                <span className="text-muted text-base font-medium"> / {maxRawTotal}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {hiddenScoreFields.map((field) => (
          <input key={field.id} type="hidden" {...register(field.id, { valueAsNumber: true })} />
        ))}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoreFields.map((field) => {
            const weightLabel = field.weight > 0 ? ` · ${field.weight}%` : '';
            return (
              <Input
                key={field.id}
                id={field.id}
                type="number"
                label={`${field.label}${weightLabel} (0-10)`}
                placeholder="e.g. 8"
                error={errors[field.id]?.message}
                {...register(field.id, { valueAsNumber: true })}
              />
            );
          })}
        </div>

        <Textarea
          id="remarks"
          label="Evaluation remarks"
          placeholder="Provide qualitative feedback for the team..."
          error={errors.remarks?.message}
          {...register('remarks')}
        />

        <div className="flex items-center justify-end gap-3 mt-2 pt-6 border-t border-white/[0.06]">
          <Link to="/judge/hackathons">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" className="gap-1.5" isLoading={isSubmitting}>
            <Save size={16} /> {existingEvaluation ? 'Update scores' : 'Submit scores'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EvaluateSubmission;
