import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axiosConfig';
import TeamChat from '../../components/events/TeamChat';

const TeamDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeam();
        const interval = setInterval(fetchTeam, 10000); // Polling every 10s to see if new members joined
        return () => clearInterval(interval);
    }, [id]);

    const fetchTeam = async () => {
        try {
            const { data } = await API.get(`/teams/${id}`);
            setTeam(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load team details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    if (error || !team) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">{error || 'Team not found'}</div></div>;

    const isComplete = team.status === 'Complete';

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <button onClick={() => navigate('/participant/my-events')} className="text-indigo-600 hover:text-indigo-800 font-medium mb-6 inline-flex items-center">
                &larr; Back to My Events
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`h-3 w-full ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}></div>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 rounded-full mb-3 inline-block">Hackathon Team</span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{team.teamName}</h1>
                            <p className="text-gray-500">Participating in <span className="font-semibold">{team.event?.eventName}</span></p>
                        </div>
                        <span className={`px-4 py-2 font-bold text-sm rounded-full ${isComplete ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                            {team.status} ({team.members.length}/{team.maxSize})
                        </span>
                    </div>

                    {!isComplete && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 text-center">
                            <h3 className="text-lg font-bold text-indigo-900 mb-2">Team is incomplete!</h3>
                            <p className="text-indigo-700 mb-4 text-sm">Share this invite code with your friends so they can join your team. Your event registration tickets will only be generated once the team is full.</p>
                            <div className="bg-white border-2 border-indigo-200 rounded-lg p-4 inline-block shadow-sm">
                                <span className="text-3xl font-mono font-bold tracking-[0.2em] text-indigo-700">{team.inviteCode}</span>
                            </div>
                        </div>
                    )}

                    {isComplete && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">✓</div>
                            <div>
                                <h3 className="text-lg font-bold text-green-900 mb-1">Team is Ready!</h3>
                                <p className="text-green-700 text-sm">Your team is fully formed. Tickets for all members have been generated. You can find them in the 'Upcoming Events' tab of your Dashboard.</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Team Roster</h3>
                        <div className="space-y-3">
                            {team.members.map((member, index) => (
                                <div key={member._id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                            {member.firstName[0]}{member.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{member.firstName} {member.lastName} {team.leader._id === member._id && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded ml-2">Leader</span>}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 font-mono text-xs">
                                        Member #{index + 1}
                                    </div>
                                </div>
                            ))}
                            {/* Empty slots for visual feedback */}
                            {[...Array(team.maxSize - team.members.length)].map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center justify-between p-4 bg-white border border-dashed border-gray-300 rounded-lg opacity-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                                        <div className="text-gray-400 font-medium italic">Empty Slot (Waiting for member...)</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <TeamChat teamId={team._id} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeamDashboard;
