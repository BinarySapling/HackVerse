import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { submissionSchema } from '../../validations/submission';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiData } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, ExternalLink, Edit } from 'lucide-react';

const getSubmissionWindow = (hackathon) => {
  if (!hackathon) return { start: null, end: null };
  const start = new Date(hackathon.submissionStart || hackathon.hackathonStart);
  const end = new Date(hackathon.submissionDeadline || hackathon.hackathonEnd);
  return { start, end };
};

const ProjectSubmission = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(submissionSchema),
  });

  const fetchSubmissionAndTeam = async () => {
    setIsLoading(true);
    try {
      const [hRes, tRes] = await Promise.all([
        api.get(`/hackathons/${hackathonId}`),
        api.get(`/hackathons/${hackathonId}/my-team`),
      ]);
      setHackathon(getApiData(hRes));
      setTeam(getApiData(tRes));

      try {
        const response = await api.get(`/hackathons/${hackathonId}/my-submission`);
        const sub = getApiData(response);
        setSubmission(sub);

        if (sub) {
          setValue('githubRepo', sub.githubRepo);
          setValue('demoUrl', sub.demoUrl || '');
          setValue('presentationUrl', sub.presentationUrl || '');
          setValue('videoUrl', sub.videoUrl || '');
          setValue('description', sub.description);
        }
      } catch {
        setSubmission(null);
      }
    } catch (err) {
      setTeam(null);
      toast.error(err.message || 'Failed to load submission page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionAndTeam();
  }, [hackathonId]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (submission) {
        await api.patch(`/submissions/${submission._id}`, data);
        toast.success('Project submission updated!');
        setIsEditMode(false);
      } else {
        await api.post(`/hackathons/${hackathonId}/submissions`, data);
        toast.success('Project submitted successfully!');
      }
      fetchSubmissionAndTeam();
    } catch (err) {
      toast.error(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader size="lg" />;

  const userId = String(user?.id || user?._id || '');
  const leaderId = String(team?.leader?._id || team?.leader || '');
  const isLeader = Boolean(team && userId && leaderId === userId);

  const { start: windowStart, end: windowEnd } = getSubmissionWindow(hackathon);
  const now = new Date();
  const windowOpen = windowStart && windowEnd && now >= windowStart && now <= windowEnd;
  const windowNotStarted = windowStart && now < windowStart;
  const windowClosed = windowEnd && now > windowEnd;

  const renderViewOnly = () => (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="font-bold text-base text-secondary">Submission Details</h3>
          {isLeader && windowOpen && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditMode(true)} className="gap-1.5">
              <Edit size={14} /> Update Links
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-xs">GitHub Repository</span>
            <a href={submission.githubRepo} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1 mt-0.5">
              {submission.githubRepo} <ExternalLink size={14} />
            </a>
          </div>
          {submission.demoUrl && (
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-xs">Demo Landing / Deployment URL</span>
              <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1 mt-0.5">
                {submission.demoUrl} <ExternalLink size={14} />
              </a>
            </div>
          )}
          {submission.presentationUrl && (
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-xs">Presentation URL</span>
              <a href={submission.presentationUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1 mt-0.5">
                {submission.presentationUrl} <ExternalLink size={14} />
              </a>
            </div>
          )}
          {submission.videoUrl && (
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-xs">Demo Video URL</span>
              <a href={submission.videoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1 mt-0.5">
                {submission.videoUrl} <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 mt-2">
          <span className="text-slate-400 font-semibold block uppercase text-xs mb-1">Project Description</span>
          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
            {submission.description}
          </p>
        </div>

        {windowClosed && (
          <p className="text-xs text-amber-600 font-medium">Submission window is closed. Edits are locked.</p>
        )}
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link to="/dashboard/participant" className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div>
        <h2 className="text-xl font-bold text-secondary">Submit Project</h2>
        <p className="text-xs text-slate-400">Share repository credentials and demo links for judge evaluations.</p>
      </div>

      {!team ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500 mb-2">You need a team to submit projects.</p>
          <Link to={`/hackathons/${hackathonId}/team`} className="text-primary hover:underline text-sm font-semibold">
            Create or join a team first
          </Link>
        </Card>
      ) : !isLeader && !submission ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">
            Only the team leader <span className="font-semibold">{team.leader?.firstName}</span> can manage project submissions.
          </p>
        </Card>
      ) : windowNotStarted ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">
            Submission window opens on {windowStart.toLocaleString()}.
          </p>
        </Card>
      ) : submission && !isEditMode ? (
        renderViewOnly()
      ) : isLeader && windowOpen ? (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="githubRepo"
              label="GitHub Repository URL"
              placeholder="https://github.com/username/project"
              error={errors.githubRepo?.message}
              {...register('githubRepo')}
            />

            <Input
              id="demoUrl"
              label="Project Demo URL (Optional)"
              placeholder="https://project-demo.vercel.app"
              error={errors.demoUrl?.message}
              {...register('demoUrl')}
            />

            <Input
              id="presentationUrl"
              label="Presentation Slides Link (Optional)"
              placeholder="https://docs.google.com/presentation/d/..."
              error={errors.presentationUrl?.message}
              {...register('presentationUrl')}
            />

            <Input
              id="videoUrl"
              label="Demo Video Link (Optional)"
              placeholder="https://youtube.com/watch?v=..."
              error={errors.videoUrl?.message}
              {...register('videoUrl')}
            />

            <Textarea
              id="description"
              label="Project Summary & Technical Stack"
              placeholder="Briefly state key features, database setup, and frontend framework selections..."
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="flex items-center justify-end gap-3 mt-4 border-t border-border pt-4">
              {submission && (
                <Button type="button" variant="secondary" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="primary" className="gap-1.5" isLoading={isSubmitting}>
                <Send size={16} /> {submission ? 'Update Submission' : 'Submit Project'}
              </Button>
            </div>
          </form>
        </Card>
      ) : windowClosed && !submission ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">
            Submission deadline has passed ({windowEnd.toLocaleString()}).
          </p>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">
            Only the team leader <span className="font-semibold">{team.leader?.firstName}</span> can manage project submissions.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ProjectSubmission;
