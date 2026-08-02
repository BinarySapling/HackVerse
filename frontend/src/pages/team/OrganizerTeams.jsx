import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../config/axios';
import Loader from '../../components/ui/Loader';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import { getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft, Users } from 'lucide-react';

const OrganizerTeams = () => {
  const { hackathonId } = useParams();
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/hackathons/${hackathonId}/teams`);
        setTeams(getApiList(res));
      } catch (err) {
        toast.error(err.message || 'Failed to load teams');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [hackathonId]);

  return (
    <div className="relative flex flex-col">
      <Link
        to="/organizer/hackathons"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary-soft w-fit mb-2 transition-colors"
      >
        <ArrowLeft size={14} /> Back to hackathons
      </Link>

      <PageHeader
        eyebrow="Event ops"
        title="Teams"
        description="All teams registered for this hackathon."
        className="!pt-0"
      />

      <SoftDivider />

      <div className="pt-8 pb-4">
        {isLoading ? (
          <Loader size="lg" />
        ) : teams.length === 0 ? (
          <p className="text-sm text-muted py-10">No teams yet.</p>
        ) : (
          <ul className="flex flex-col">
            {teams.map((team, index) => (
              <li key={team._id}>
                {index > 0 && <div className="soft-row-divider" />}
                <div className="py-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Users size={16} className="text-primary-soft/80" />
                    <h3 className="font-display font-semibold text-lg tracking-tight">
                      {team.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted mb-4">
                    Leader: {team.leader?.firstName} {team.leader?.lastName} ({team.leader?.email})
                  </p>
                  <p className="text-[11px] tracking-[0.16em] uppercase text-muted/70 mb-2">
                    Members ({team.members?.length || 0})
                  </p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-secondary/90">
                    {(team.members || []).map((m) => (
                      <li key={m._id}>
                        {m.firstName} {m.lastName}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrganizerTeams;
