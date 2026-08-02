import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import { hackathonSchema } from '../../validations/hackathon';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { buildHackathonFormData } from '../../utils/hackathonForm';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { getApiData } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const emptyPrize = () => ({ title: '', value: '', description: '' });

const emptyCriterion = () => ({ criteriaName: '', weight: 10, description: '' });

const HackathonEdit = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prizes, setPrizes] = useState([emptyPrize()]);
  const [criteria, setCriteria] = useState([emptyCriterion()]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hackathonSchema),
  });

  const formatDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const updatePrize = (index, field, value) => {
    setPrizes((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPrize = () => {
    setPrizes((prev) => [...prev, emptyPrize()]);
  };

  const removePrize = (index) => {
    setPrizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBannerFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/hackathons/${hackathonId}`);
        const h = getApiData(response);

        if (!h) {
          toast.error('Hackathon not found.');
          return navigate('/dashboard/organizer');
        }

        if (h.status === 'completed' || h.status === 'archived') {
          toast.error('Completed hackathons cannot be edited.');
          return navigate(`/hackathons/${h.slug || h._id}`);
        }

        setValue('title', h.title);
        setValue('tagline', h.tagline || '');
        setValue('description', h.description);
        setValue('banner', h.banner || '');
        setBannerPreview(h.banner ? resolveAssetUrl(h.banner) : null);
        setValue('theme', h.theme || '');
        setValue('mode', h.mode || 'online');
        setValue('venue', h.venue || '');
        setValue('registrationStart', formatDatetimeLocal(h.registrationStart));
        setValue('registrationEnd', formatDatetimeLocal(h.registrationEnd));
        setValue('hackathonStart', formatDatetimeLocal(h.hackathonStart));
        setValue('hackathonEnd', formatDatetimeLocal(h.hackathonEnd));
        setValue('submissionStart', formatDatetimeLocal(h.submissionStart));
        setValue('submissionDeadline', formatDatetimeLocal(h.submissionDeadline));
        setValue('minTeamSize', h.minTeamSize);
        setValue('maxTeamSize', h.maxTeamSize);
        setValue('maxTeams', h.maxTeams || undefined);
        setValue('prizePool', h.prizePool || '');
        setValue('contactEmail', h.contactEmail);
        setValue('rules', h.rules || '');
        setPrizes(
          h.prizes?.length
            ? h.prizes.map((p) => ({
                title: p.title || '',
                value: p.value || '',
                description: p.description || '',
              }))
            : [emptyPrize()]
        );
        setCriteria(
          h.judgingCriteria?.length
            ? h.judgingCriteria.map((c) => ({
                criteriaName: c.criteriaName || '',
                weight: c.weight ?? 10,
                description: c.description || '',
              }))
            : [emptyCriterion()]
        );
      } catch (err) {
        toast.error('Failed to load hackathon data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [hackathonId]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
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

      const payload = {
        ...data,
        banner: bannerFile ? undefined : data.banner?.trim() || null,
        theme: data.theme?.trim() || null,
        venue: data.venue?.trim() || null,
        mode: data.mode || 'online',
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
        await api.patch(`/hackathons/${hackathonId}`, buildHackathonFormData(payload, bannerFile));
      } else {
        await api.patch(`/hackathons/${hackathonId}`, payload);
      }
      toast.success('Hackathon details updated successfully!');
      navigate('/dashboard/organizer');
    } catch (err) {
      toast.error(err.message || 'Update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link to="/dashboard/organizer" className="text-muted hover:text-secondary flex items-center gap-1 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div>
        <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-3 font-medium">
          Edit event
        </p>
        <h1 className="text-3xl font-display font-semibold tracking-tight">Edit hackathon</h1>
        <p className="text-sm text-muted mt-2">
          Modify timeline structures or size constraints for this event.
        </p>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input
              id="title"
              label="Hackathon Title"
              error={errors.title?.message}
              {...register('title')}
            />

            <Input
              id="tagline"
              label="Tagline"
              error={errors.tagline?.message}
              {...register('tagline')}
            />

            <Textarea
              id="description"
              label="Event Description"
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">Poster / Banner</p>
                <p className="text-xs text-muted">Upload an image to Cloudinary or paste a URL (optional).</p>
              </div>
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt=""
                  className="h-36 w-full rounded-xl object-cover ring-1 ring-white/[0.08]"
                />
              )}
              <input
                id="bannerFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleBannerFileChange}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/20 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-soft hover:file:bg-primary/30"
              />
              <Input
                id="banner"
                label="Or banner image URL"
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
                  onClick={() => setCriteria((prev) => [...prev, emptyCriterion()])}
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
              label="Contact Email"
              error={errors.contactEmail?.message}
              {...register('contactEmail')}
            />

            <Textarea
              id="rules"
              label="Rules & Regulations"
              error={errors.rules?.message}
              {...register('rules')}
            />

            <div className="flex items-center justify-end gap-3 mt-4 border-t border-white/[0.06] pt-4">
              <Link to="/dashboard/organizer">
                <Button variant="secondary">Cancel</Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default HackathonEdit;
