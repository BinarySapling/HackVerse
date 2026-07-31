import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../config/axios';
import { evaluationSchema } from '../../validations/evaluation';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const scoreFields = [
  { id: 'innovationScore', label: 'Innovation' },
  { id: 'uiuxScore', label: 'UI/UX' },
  { id: 'technicalScore', label: 'Technical Complexity' },
  { id: 'presentationScore', label: 'Presentation' },
  { id: 'codeQualityScore', label: 'Code Quality' },
  { id: 'problemSolvingScore', label: 'Problem Solving' },
];

const EvaluateSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingEvaluation, setExistingEvaluation] = useState(null);

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

  const values = watch();
  const totalScore = scoreFields.reduce((sum, field) => sum + (Number(values[field.id]) || 0), 0);

  useEffect(() => {
    const fetchExisting = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/evaluations/me');
        const list = getApiList(response);
        const match = list.find((ev) => ev.submission?._id === submissionId || ev.submission === submissionId);

        if (match) {
          setExistingEvaluation(match);
          scoreFields.forEach((field) => setValue(field.id, match[field.id] ?? 0));
          setValue('remarks', match.remarks);
        }
      } catch (err) {
        console.error('Failed to load existing evaluations:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [submissionId, setValue]);

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
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link to="/judge/hackathons" className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to Assigned Events
      </Link>

      <div>
        <h2 className="text-xl font-bold text-secondary">
          {existingEvaluation ? 'Update Evaluation' : 'Score Submission'}
        </h2>
        <p className="text-xs text-slate-400">
          Score each criterion from 0 to 10. Total updates automatically.
        </p>
      </div>

      <Card>
        <div className="bg-slate-50 border border-border p-4 rounded-lg text-xs text-slate-500 mb-6 flex justify-between items-center">
          <div>
            <span className="font-bold text-secondary uppercase">Submission Reference:</span>
            <div className="font-mono text-slate-600 font-semibold">{submissionId}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase text-slate-400 font-bold">Total Score</div>
            <div className="text-lg font-extrabold text-primary">{totalScore} / 60</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoreFields.map((field) => (
              <Input
                key={field.id}
                id={field.id}
                type="number"
                label={`${field.label} (0-10)`}
                placeholder="e.g. 8"
                error={errors[field.id]?.message}
                {...register(field.id, { valueAsNumber: true })}
              />
            ))}
          </div>

          <Textarea
            id="remarks"
            label="Evaluation Remarks"
            placeholder="Provide qualitative feedback for the team..."
            error={errors.remarks?.message}
            {...register('remarks')}
          />

          <div className="flex items-center justify-end gap-3 mt-4 border-t border-border pt-4">
            <Link to="/judge/hackathons">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" className="gap-1.5" isLoading={isSubmitting}>
              <Save size={16} /> {existingEvaluation ? 'Update Scores' : 'Submit Scores'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EvaluateSubmission;
