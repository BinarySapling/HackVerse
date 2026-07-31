import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../config/axios';
import { hackathonSchema } from '../../validations/hackathon';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const emptyPrize = () => ({ title: '', value: '', description: '' });

const HackathonCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prizes, setPrizes] = useState([
    { title: '1st Place', value: '', description: '' },
    { title: '2nd Place', value: '', description: '' },
    { title: '3rd Place', value: '', description: '' },
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const judgeEmails = (data.judgeEmails || '')
        .split(/[\n,]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      const cleanedPrizes = prizes
        .map((p) => ({
          title: (p.title || '').trim(),
          value: (p.value || '').trim() || null,
          description: (p.description || '').trim() || null,
        }))
        .filter((p) => p.title);

      const payload = {
        ...data,
        banner: data.banner?.trim() || undefined,
        judgeEmails,
        prizes: cleanedPrizes,
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

      await api.post('/hackathons', payload);
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
      <Link to="/dashboard/organizer" className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div>
        <h2 className="text-xl font-bold text-secondary">Launch Hackathon</h2>
        <p className="text-xs text-slate-400">Establish registration limits, evaluation weights, and timeline structures.</p>
      </div>

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

          <Input
            id="banner"
            label="Poster / Banner Image URL (optional)"
            placeholder="https://example.com/poster.jpg"
            error={errors.banner?.message}
            {...register('banner')}
          />

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
                <p className="text-xs text-slate-400">Add prizes for 1st, 2nd, 3rd, and any other winners.</p>
              </div>
              <Button type="button" variant="secondary" onClick={addPrize}>
                <Plus size={14} className="mr-1 inline" /> Add prize
              </Button>
            </div>
            {prizes.map((prize, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border border-border rounded-lg p-3">
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

          <Textarea
            id="judgeEmails"
            label="Invite Judges"
            placeholder="judge1@example.com, judge2@example.com"
            error={errors.judgeEmails?.message}
            {...register('judgeEmails')}
          />

          <div className="flex items-center justify-end gap-3 mt-4 border-t border-border pt-4">
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
