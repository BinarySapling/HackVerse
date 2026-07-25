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
import { getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const HackathonEdit = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hackathonSchema),
  });

  // Convert Date from DB to HTML local time format
  const formatDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/hackathons');
        const list = getApiList(response);
        const h = list.find((item) => item._id === hackathonId);

        if (!h) {
          toast.error('Hackathon not found.');
          return navigate('/dashboard/organizer');
        }

        setValue('title', h.title);
        setValue('tagline', h.tagline || '');
        setValue('description', h.description);
        setValue('registrationStart', formatDatetimeLocal(h.registrationStart));
        setValue('registrationEnd', formatDatetimeLocal(h.registrationEnd));
        setValue('hackathonStart', formatDatetimeLocal(h.hackathonStart));
        setValue('hackathonEnd', formatDatetimeLocal(h.hackathonEnd));
        setValue('minTeamSize', h.minTeamSize);
        setValue('maxTeamSize', h.maxTeamSize);
        setValue('contactEmail', h.contactEmail);
        setValue('rules', h.rules || '');
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
      const payload = {
        ...data,
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        hackathonStart: new Date(data.hackathonStart).toISOString(),
        hackathonEnd: new Date(data.hackathonEnd).toISOString(),
      };

      await api.patch(`/hackathons/${hackathonId}`, payload);
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
      <Link to="/dashboard/organizer" className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div>
        <h2 className="text-xl font-bold text-secondary">Edit Hackathon</h2>
        <p className="text-xs text-slate-400">Modify timeline structures or size constraints for this event.</p>
      </div>

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

            <div className="flex items-center justify-end gap-3 mt-4 border-t border-border pt-4">
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
