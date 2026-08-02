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
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { getApiData } from '../../utils/apiResponse';
import { resolveAssetUrl } from '../../utils/assetUrl';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, ExternalLink, Edit } from 'lucide-react';

const getSubmissionWindow = (hackathon) => {
  if (!hackathon) return { start: null, end: null };
  const start = new Date(hackathon.submissionStart || hackathon.hackathonStart);
  const end = new Date(hackathon.submissionDeadline || hackathon.hackathonEnd);
  return { start, end };
};

const statusVariant = (status) => {
  if (status === 'approved') return 'success';
  if (status === 'under_review') return 'primary';
  if (status === 'rejected') return 'danger';
  return 'warning';
};

const formatStatus = (status) => {
  const labels = {
    pending: 'Pending review',
    under_review: 'Under review',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return labels[status] || 'Pending review';
};

const isUploadedPath = (url) => url?.startsWith('/uploads/');

const ProjectSubmission = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [presentationFile, setPresentationFile] = useState(null);

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
          setValue('projectName', sub.projectName || '');
          setValue('githubRepo', sub.githubRepo);
          setValue('techStack', Array.isArray(sub.techStack) ? sub.techStack.join(', ') : '');
          setValue('demoUrl', sub.demoUrl || '');
          setValue('presentationUrl', sub.presentationUrl || '');
          setValue('videoUrl', sub.videoUrl || '');
          setValue('screenshotUrl', sub.screenshotUrl || '');
          setValue('description', sub.description || '');
          setValue('problemStatement', sub.problemStatement || '');
          setValue('solution', sub.solution || '');
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

  const buildRequestBody = (data) => {
    const fields = {
      projectName: data.projectName?.trim() || null,
      githubRepo: data.githubRepo,
      techStack: (data.techStack || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      description: data.description,
      problemStatement: data.problemStatement,
      solution: data.solution,
      screenshotUrl: data.screenshotUrl?.trim() || null,
      demoUrl: data.demoUrl?.trim() || null,
      presentationUrl: data.presentationUrl?.trim() || null,
      videoUrl: data.videoUrl?.trim() || null,
    };

    if (screenshotFile || presentationFile) {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value == null) return;
        if (Array.isArray(value)) {
          formData.append(key, value.join(', '));
        } else {
          formData.append(key, value);
        }
      });
      if (screenshotFile) formData.append('screenshot', screenshotFile);
      if (presentationFile) formData.append('presentation', presentationFile);
      return formData;
    }

    return fields;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = buildRequestBody(data);

      if (submission) {
        await api.patch(`/submissions/${submission._id}`, payload);
        toast.success('Project submission updated!');
        setIsEditMode(false);
      } else {
        await api.post(`/hackathons/${hackathonId}/submissions`, payload);
        toast.success('Project submitted successfully!');
      }
      setScreenshotFile(null);
      setPresentationFile(null);
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

  const renderAssetLink = (label, url) => {
    if (!url) return null;
    const href = resolveAssetUrl(url);
    const labelText = isUploadedPath(url) ? `${label} (uploaded)` : url;
    return (
      <div>
        <span className="text-muted font-semibold block uppercase text-xs">{label}</span>
        <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1 mt-0.5">
          {labelText} <ExternalLink size={14} />
        </a>
        {isUploadedPath(url) && url.match(/\.(png|jpe?g|gif|webp)$/i) && (
          <img src={href} alt={label} className="mt-2 max-h-40 rounded-lg border border-white/10" />
        )}
      </div>
    );
  };

  const renderViewOnly = () => (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
          <h3 className="font-bold text-base text-secondary">Submission Details</h3>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(submission.status)}>
              {formatStatus(submission.status)}
            </Badge>
            {isLeader && windowOpen && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditMode(true)} className="gap-1.5">
                <Edit size={14} /> Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
          {submission.projectName && (
            <div>
              <span className="text-muted font-semibold block uppercase text-xs">Project Name</span>
              <p className="font-medium mt-0.5">{submission.projectName}</p>
            </div>
          )}
          <div>
            <span className="text-muted font-semibold block uppercase text-xs">GitHub Repository</span>
            <a href={submission.githubRepo} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1 mt-0.5">
              {submission.githubRepo} <ExternalLink size={14} />
            </a>
          </div>
          {submission.techStack?.length > 0 && (
            <div>
              <span className="text-muted font-semibold block uppercase text-xs">Tech Stack</span>
              <p className="font-medium mt-0.5">{submission.techStack.join(', ')}</p>
            </div>
          )}
          {submission.demoUrl && renderAssetLink('Demo URL', submission.demoUrl)}
          {submission.presentationUrl && renderAssetLink('Presentation', submission.presentationUrl)}
          {submission.videoUrl && renderAssetLink('Demo Video', submission.videoUrl)}
          {submission.screenshotUrl && renderAssetLink('Screenshot', submission.screenshotUrl)}
        </div>

        <div className="border-t border-white/[0.06] pt-4 mt-2 space-y-4">
          <div>
            <span className="text-muted font-semibold block uppercase text-xs mb-1">Summary</span>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {submission.description}
            </p>
          </div>
          {submission.problemStatement && (
            <div>
              <span className="text-muted font-semibold block uppercase text-xs mb-1">Problem Statement</span>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {submission.problemStatement}
              </p>
            </div>
          )}
          {submission.solution && (
            <div>
              <span className="text-muted font-semibold block uppercase text-xs mb-1">Solution</span>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {submission.solution}
              </p>
            </div>
          )}
        </div>

        {windowClosed && (
          <p className="text-xs text-amber-600 font-medium">Submission window is closed. Edits are locked.</p>
        )}
      </Card>
    </div>
  );

  return (
    <div className="relative flex flex-col gap-8 max-w-3xl">
      <Link
        to="/dashboard/participant"
        className="text-muted hover:text-primary-soft flex items-center gap-1.5 text-xs transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div>
        <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-3 font-medium">
          Submissions
        </p>
        <h1 className="text-3xl font-display font-semibold tracking-tight">Submit project</h1>
        <p className="text-sm text-muted mt-2">
          Share your problem, solution, repository, and demo materials for organizer review.
        </p>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {!team ? (
        <Card className="text-center py-12">
          <p className="text-sm text-muted mb-2">You need a team to submit projects.</p>
          <Link to={`/hackathons/${hackathonId}/team`} className="text-primary hover:underline text-sm font-semibold">
            Create or join a team first
          </Link>
        </Card>
      ) : !isLeader && !submission ? (
        <Card className="text-center py-12">
          <p className="text-sm text-muted">
            Only the team leader <span className="font-semibold">{team.leader?.firstName}</span> can manage project submissions.
          </p>
        </Card>
      ) : windowNotStarted ? (
        <Card className="text-center py-12">
          <p className="text-sm text-muted">
            Submission window opens on {windowStart.toLocaleString()}.
          </p>
        </Card>
      ) : submission && !isEditMode ? (
        renderViewOnly()
      ) : isLeader && windowOpen ? (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              id="projectName"
              label="Project Name (optional)"
              placeholder="e.g. Smart Campus Navigator"
              error={errors.projectName?.message}
              {...register('projectName')}
            />

            <Input
              id="githubRepo"
              label="GitHub Repository URL"
              placeholder="https://github.com/username/project"
              error={errors.githubRepo?.message}
              {...register('githubRepo')}
            />

            <Input
              id="techStack"
              label="Tech Stack (comma separated)"
              placeholder="React, Node.js, MongoDB"
              error={errors.techStack?.message}
              {...register('techStack')}
            />

            <Textarea
              id="problemStatement"
              label="Problem Statement"
              placeholder="What problem does your project solve?"
              error={errors.problemStatement?.message}
              {...register('problemStatement')}
            />

            <Textarea
              id="solution"
              label="Solution"
              placeholder="How does your project solve it?"
              error={errors.solution?.message}
              {...register('solution')}
            />

            <Textarea
              id="description"
              label="Project Summary"
              placeholder="Brief overview of key features..."
              error={errors.description?.message}
              {...register('description')}
            />

            <Input
              id="demoUrl"
              label="Project Demo URL (optional)"
              placeholder="https://project-demo.vercel.app"
              error={errors.demoUrl?.message}
              {...register('demoUrl')}
            />

            <div>
              <label htmlFor="screenshot" className="block text-sm font-medium text-secondary mb-1.5">
                Screenshot (optional)
              </label>
              <input
                id="screenshot"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-secondary hover:file:bg-white/15"
              />
              <p className="text-xs text-muted mt-1">JPEG, PNG, WebP, or GIF — max 10MB. Or paste a URL below.</p>
            </div>

            <Input
              id="screenshotUrl"
              label="Screenshot URL (optional)"
              placeholder="https://example.com/screenshot.png"
              error={errors.screenshotUrl?.message}
              {...register('screenshotUrl')}
            />

            <div>
              <label htmlFor="presentation" className="block text-sm font-medium text-secondary mb-1.5">
                Presentation file (optional)
              </label>
              <input
                id="presentation"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setPresentationFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-secondary hover:file:bg-white/15"
              />
              <p className="text-xs text-muted mt-1">PDF or image — max 10MB. Or paste a slides URL below.</p>
            </div>

            <Input
              id="presentationUrl"
              label="Presentation Slides Link (optional)"
              placeholder="https://docs.google.com/presentation/d/..."
              error={errors.presentationUrl?.message}
              {...register('presentationUrl')}
            />

            <Input
              id="videoUrl"
              label="Demo Video Link (optional)"
              placeholder="https://youtube.com/watch?v=..."
              error={errors.videoUrl?.message}
              {...register('videoUrl')}
            />

            <div className="flex items-center justify-end gap-3 mt-4 border-t border-white/[0.06] pt-4">
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
          <p className="text-sm text-muted">
            Submission deadline has passed ({windowEnd.toLocaleString()}).
          </p>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <p className="text-sm text-muted">
            Only the team leader <span className="font-semibold">{team.leader?.firstName}</span> can manage project submissions.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ProjectSubmission;
