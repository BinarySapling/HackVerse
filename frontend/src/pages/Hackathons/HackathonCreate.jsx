import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/axios';
import { hackathonSchema } from '../../validations/hackathon';
import { buildHackathonFormData } from '../../utils/hackathonForm';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react';

const emptyPrize = () => ({ title: '', value: '', description: '' });

const HackathonCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prizes, setPrizes] = useState([
    { title: '1st Place', value: '', description: '' },
    { title: '2nd Place', value: '', description: '' },
    { title: '3rd Place', value: '', description: '' },
  ]);
  const [judgeEmails, setJudgeEmails] = useState(['']);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [criteria, setCriteria] = useState([
    { criteriaName: 'Innovation', weight: 20, description: '' },
    { criteriaName: 'Technical Complexity', weight: 20, description: '' },
    { criteriaName: 'UI/UX', weight: 20, description: '' },
    { criteriaName: 'Functionality', weight: 20, description: '' },
    { criteriaName: 'Presentation', weight: 20, description: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      minTeamSize: 1,
      maxTeamSize: 4,
      banner: '',
      mode: 'online',
      theme: '',
      venue: '',
    },
  });

  const updatePrize = (index, field, value) => {
    setPrizes((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPrize = () => {
    setPrizes((prev) => [...prev, emptyPrize()]);
  };

  const removePrize = (index) => {
    setPrizes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateJudgeEmail = (index, value) => {
    setJudgeEmails((prev) => prev.map((email, i) => (i === index ? value : email)));
  };

  const addJudgeEmail = () => {
    setJudgeEmails((prev) => [...prev, '']);
  };

  const removeJudgeEmail = (index) => {
    setJudgeEmails((prev) => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== index)));
  };

  const handleBannerFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const removeBannerFile = () => {
    if (bannerPreview && bannerFile) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview(null);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const cleanedJudgeEmails = judgeEmails
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      const cleanedPrizes = prizes
        .map((p) => ({
          title: (p.title || '').trim(),
          value: (p.value || '').trim() || null,
          description: (p.description || '').trim() || null,
        }))
        .filter((p) => p.title);

      const cleanedCriteria = criteria
        .map((c) => ({
          criteriaName: (c.criteriaName || '').trim(),
          weight: Number(c.weight) || 0,
          description: (c.description || '').trim() || null,
        }))
        .filter((c) => c.criteriaName);

      if (cleanedCriteria.length > 0) {
        const weightSum = cleanedCriteria.reduce((sum, c) => sum + c.weight, 0);
        if (Math.abs(weightSum - 100) > 1) {
          toast.error('Judging criteria weights must sum to approximately 100');
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        ...data,
        banner: bannerFile ? undefined : data.banner?.trim() || undefined,
        theme: data.theme?.trim() || undefined,
        venue: data.venue?.trim() || undefined,
        mode: data.mode || 'online',
        judgeEmails: cleanedJudgeEmails,
        prizes: cleanedPrizes,
        judgingCriteria: cleanedCriteria,
        maxTeams: data.maxTeams || undefined,
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        hackathonStart: new Date(data.hackathonStart).toISOString(),
        hackathonEnd: new Date(data.hackathonEnd).toISOString(),
        submissionStart: data.submissionStart
          ? new Date(data.submissionStart).toISOString()
          : undefined,
        submissionDeadline: data.submissionDeadline
          ? new Date(data.submissionDeadline).toISOString()
          : undefined,
      };

      if (bannerFile) {
        await api.post('/hackathons', buildHackathonFormData(payload, bannerFile));
      } else {
        await api.post('/hackathons', payload);
      }
      toast.success('Hackathon launched successfully!');
      navigate('/dashboard/organizer');
    } catch (err) {
      toast.error(err.message || 'Failed to create hackathon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link
        to="/dashboard/organizer"
        className="text-muted hover:text-primary-soft flex items-center gap-1 text-xs transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div>
        <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-3 font-medium">
          Create event
        </p>
        <h1 className="text-3xl font-display font-semibold tracking-tight">Launch hackathon</h1>
        <p className="text-sm text-muted mt-2">
          Establish registration limits, evaluation weights, and timeline structures.
        </p>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Input
            id="title"
            label="Hackathon Title"
            placeholder="e.g. Major Project Showcase 2026"
            error={errors.title?.message}
            {...register('title')}
          />

          <Input
            id="tagline"
            label="Tagline / Short description"
            placeholder="e.g. Turn academic projects into industry prototypes"
            error={errors.tagline?.message}
            {...register('tagline')}
          />

          <Textarea
            id="description"
            label="Event Description & Objectives"
            placeholder="Detailed details regarding problem statements, targets, or themes..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-secondary">Poster / Banner Image</p>
              <p className="text-xs text-muted">Upload a photo from your local computer to Cloudinary or provide an image URL.</p>
            </div>

            {/* Local Photo Upload Box */}
            <div className="relative rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/50 bg-surfaceDark/60 p-5 transition-all flex flex-col items-center justify-center text-center group cursor-pointer">
              <input
                id="bannerFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleBannerFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                title="Choose photo from local system"
              />
              {bannerPreview ? (
                <div className="relative w-full flex flex-col items-center">
                  <img
                    src={bannerPreview}
                    alt="Poster Preview"
                    className="h-44 w-full rounded-xl object-cover ring-1 ring-white/10 shadow-md"
                  />
                  <div className="mt-3 flex items-center gap-2 z-20">
                    <span className="text-xs text-primary-soft font-medium flex items-center gap-1">
                      <ImageIcon size={14} /> {bannerFile ? bannerFile.name : 'Image preview'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBannerFile();
                      }}
                      className="text-xs text-danger hover:underline font-semibold flex items-center gap-1 bg-surfaceDark px-2.5 py-1 rounded-md border border-white/10"
                    >
                      <X size={13} /> Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3 pointer-events-none">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary-soft flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary">
                      <span className="text-primary-soft font-semibold">Click to upload photo</span> from your local system
                    </p>
                    <p className="text-xs text-muted mt-0.5">Supports PNG, JPG, WebP, or GIF (max 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            <Input
              id="banner"
              label="Or paste poster image URL"
              placeholder="https://example.com/poster.jpg"
              error={errors.banner?.message}
              disabled={Boolean(bannerFile)}
              {...register('banner')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="theme"
              label="Theme (optional)"
              placeholder="e.g. AI for education"
              error={errors.theme?.message}
              {...register('theme')}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mode" className="text-xs font-semibold text-muted uppercase tracking-wide">
                Mode
              </label>
              <select
                id="mode"
                className="h-10 rounded-lg ring-1 ring-white/[0.08] bg-surfaceDark px-3 text-sm text-secondary"
                {...register('mode')}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <Input
              id="venue"
              label="Venue (optional)"
              placeholder="e.g. Campus Auditorium / Zoom"
              error={errors.venue?.message}
              {...register('venue')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="registrationStart"
              type="datetime-local"
              label="Registration Window Starts"
              error={errors.registrationStart?.message}
              {...register('registrationStart')}
            />
            <Input
              id="registrationEnd"
              type="datetime-local"
              label="Registration Window Ends"
              error={errors.registrationEnd?.message}
              {...register('registrationEnd')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="hackathonStart"
              type="datetime-local"
              label="Hackathon Begins"
              error={errors.hackathonStart?.message}
              {...register('hackathonStart')}
            />
            <Input
              id="hackathonEnd"
              type="datetime-local"
              label="Hackathon Concludes"
              error={errors.hackathonEnd?.message}
              {...register('hackathonEnd')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="submissionStart"
              type="datetime-local"
              label="Submission Window Starts (optional)"
              error={errors.submissionStart?.message}
              {...register('submissionStart')}
            />
            <Input
              id="submissionDeadline"
              type="datetime-local"
              label="Submission Deadline (optional)"
              error={errors.submissionDeadline?.message}
              {...register('submissionDeadline')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="minTeamSize"
              type="number"
              label="Minimum Team Capacity"
              error={errors.minTeamSize?.message}
              {...register('minTeamSize', { valueAsNumber: true })}
            />
            <Input
              id="maxTeamSize"
              type="number"
              label="Maximum Team Capacity"
              error={errors.maxTeamSize?.message}
              {...register('maxTeamSize', { valueAsNumber: true })}
            />
            <Input
              id="maxTeams"
              type="number"
              label="Max Teams (optional)"
              error={errors.maxTeams?.message}
              {...register('maxTeams', { valueAsNumber: true })}
            />
          </div>

          <Input
            id="prizePool"
            label="Total Prize Pool (optional)"
            placeholder="e.g. $10,000"
            error={errors.prizePool?.message}
            {...register('prizePool')}
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">Prize breakdown</p>
                <p className="text-xs text-muted">Add prizes for 1st, 2nd, 3rd, and any other winners.</p>
              </div>
              <Button type="button" variant="secondary" onClick={addPrize}>
                <Plus size={14} className="mr-1 inline" /> Add prize
              </Button>
            </div>
            {prizes.map((prize, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start ring-1 ring-white/[0.08] rounded-2xl p-3">
                <div className="md:col-span-3">
                  <Input
                    id={`prize-title-${index}`}
                    label="Place / Title"
                    placeholder="e.g. 1st Place"
                    value={prize.title}
                    onChange={(e) => updatePrize(index, 'title', e.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    id={`prize-value-${index}`}
                    label="Amount / Value"
                    placeholder="e.g. $5,000"
                    value={prize.value}
                    onChange={(e) => updatePrize(index, 'value', e.target.value)}
                  />
                </div>
                <div className="md:col-span-5">
                  <Input
                    id={`prize-desc-${index}`}
                    label="Description (optional)"
                    placeholder="e.g. Cash + internship offer"
                    value={prize.description}
                    onChange={(e) => updatePrize(index, 'description', e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 flex md:justify-end md:pt-7">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removePrize(index)}
                    disabled={prizes.length <= 1}
                    aria-label="Remove prize"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">Judging criteria</p>
                <p className="text-xs text-muted">Name + weight (0-100). Weights should roughly add to 100.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setCriteria((prev) => [...prev, { criteriaName: '', weight: 10, description: '' }])
                }
              >
                <Plus size={14} className="mr-1 inline" /> Add criterion
              </Button>
            </div>
            {criteria.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start ring-1 ring-white/[0.08] rounded-2xl p-3">
                <div className="md:col-span-5">
                  <Input
                    id={`criteria-name-${index}`}
                    label="Criteria name"
                    value={item.criteriaName}
                    onChange={(e) =>
                      setCriteria((prev) =>
                        prev.map((c, i) => (i === index ? { ...c, criteriaName: e.target.value } : c))
                      )
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    id={`criteria-weight-${index}`}
                    type="number"
                    label="Weight"
                    value={item.weight}
                    onChange={(e) =>
                      setCriteria((prev) =>
                        prev.map((c, i) =>
                          i === index ? { ...c, weight: Number(e.target.value) } : c
                        )
                      )
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    id={`criteria-desc-${index}`}
                    label="Note (optional)"
                    value={item.description}
                    onChange={(e) =>
                      setCriteria((prev) =>
                        prev.map((c, i) =>
                          i === index ? { ...c, description: e.target.value } : c
                        )
                      )
                    }
                  />
                </div>
                <div className="md:col-span-1 flex md:justify-end md:pt-7">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCriteria((prev) => prev.filter((_, i) => i !== index))}
                    disabled={criteria.length <= 1}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Input
            id="contactEmail"
            type="email"
            label="Contact Email for Queries"
            placeholder="support@university.edu"
            error={errors.contactEmail?.message}
            {...register('contactEmail')}
          />

          <Textarea
            id="rules"
            label="Rules & Regulations"
            placeholder="Code of conduct, evaluation guidelines..."
            error={errors.rules?.message}
            {...register('rules')}
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">Invite judges</p>
                <p className="text-xs text-muted">Add one email per judge. You can invite more later.</p>
              </div>
              <Button type="button" variant="secondary" onClick={addJudgeEmail}>
                <Plus size={14} className="mr-1 inline" /> Add judge
              </Button>
            </div>
            {judgeEmails.map((email, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    id={`judge-email-${index}`}
                    type="email"
                    label={`Judge ${index + 1} email`}
                    placeholder="judge@university.edu"
                    value={email}
                    onChange={(e) => updateJudgeEmail(index, e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeJudgeEmail(index)}
                  disabled={judgeEmails.length <= 1 && !email}
                  aria-label="Remove judge"
                  className="mb-0"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 border-t border-white/[0.06] pt-4">
            <Link to="/dashboard/organizer">
              <Button variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Launch Event
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default HackathonCreate;
