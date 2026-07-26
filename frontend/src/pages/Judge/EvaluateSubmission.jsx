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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(evaluationSchema),
  });

  useEffect(() => {
    const fetchExisting = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/evaluations/me');
        const list = getApiList(response);
        const match = list.find((ev) => ev.submission?._id === submissionId || ev.submission === submissionId);
        
        if (match) {
          setExistingEvaluation(match);
          setValue('innovationScore', match.innovationScore);
          setValue('technicalScore', match.technicalScore);
          setValue('presentationScore', match.presentationScore);
          setValue('remarks', match.remarks);
        }
      } catch (err) {
        console.error('Failed to load existing evaluations:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExisting();
  }, [submissionId]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (existingEvaluation) {
        // Update existing evaluation
        await api.patch(`/evaluations/${existingEvaluation._id}`, data);
        toast.success('Evaluation updated successfully!');
      } else {
        // Create new evaluation
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link to="/judge/hackathons" className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to Assigned Events
      </Link>

      <div>
        <h2 className="text-xl font-bold text-secondary">
          {existingEvaluation ? 'Update Evaluation' : 'Score Submission'}
        </h2>
        <p className="text-xs text-slate-400">
          Provide numeric scores from 0 to 10 across dimensions. Total score compiles dynamically.
        </p>
      </div>

      <Card>
        <div className="bg-slate-50 border border-border p-4 rounded-lg text-xs text-slate-500 mb-6 flex flex-col gap-1">
          <span className="font-bold text-secondary uppercase">Submission Reference:</span>
          <span className="font-mono text-slate-600 font-semibold">{submissionId}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="innovationScore"
              type="number"
              label="Innovation Score (0-10)"
              placeholder="e.g. 8"
              error={errors.innovationScore?.message}
              {...register('innovationScore', { valueAsNumber: true })}
            />

            <Input
              id="technicalScore"
              type="number"
              label="Technical Score (0-10)"
              placeholder="e.g. 7"
              error={errors.technicalScore?.message}
              {...register('technicalScore', { valueAsNumber: true })}
            />

            <Input
              id="presentationScore"
              type="number"
              label="Presentation Score (0-10)"
              placeholder="e.g. 9"
              error={errors.presentationScore?.message}
              {...register('presentationScore', { valueAsNumber: true })}
            />
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
