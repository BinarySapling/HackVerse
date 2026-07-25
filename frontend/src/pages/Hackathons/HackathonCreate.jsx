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
import { ArrowLeft } from 'lucide-react';

const HackathonCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hackathonSchema),
    defaultValues: {
      minTeamSize: 1,
      maxTeamSize: 4,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Dates should be formatted as ISO Strings
      const payload = {
        ...data,
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        hackathonStart: new Date(data.hackathonStart).toISOString(),
        hackathonEnd: new Date(data.hackathonEnd).toISOString(),
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
