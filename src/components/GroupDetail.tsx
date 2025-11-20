// import React, { useState } from 'react';
// import { base44 } from '@/api/base44Client';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Button } from '@/components/ui/button';
// import { ArrowLeft, Shuffle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import { useNavigate } from 'react-router-dom';
// import ParticipantList from '../components/secretsanta/ParticipantList';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// export default function GroupDetail() {
//     const navigate = useNavigate();
//     const queryClient = useQueryClient();
//     const urlParams = new URLSearchParams(window.location.search);
//     const groupId = urlParams.get('id');

//     const { data: group, isLoading: groupLoading } = useQuery({
//         queryKey: ['group', groupId],
//         queryFn: () => base44.entities.SecretSantaGroup.filter({ id: groupId }).then(r => r[0]),
//         enabled: !!groupId,
//     });

//     const { data: participants = [], isLoading: participantsLoading } = useQuery({
//         queryKey: ['participants', groupId],
//         queryFn: () => base44.entities.Participant.filter({ group_id: groupId }),
//         enabled: !!groupId,
//     });

//     const addParticipantMutation = useMutation({
//         mutationFn: (data) => {
//             const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
//             return base44.entities.Participant.create({
//                 ...data,
//                 group_id: groupId,
//                 access_token: token,
//             });
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries(['participants', groupId]);
//             toast.success('Deelnemer toegevoegd!');
//         },
//     });

//     const removeParticipantMutation = useMutation({
//         mutationFn: (id) => base44.entities.Participant.delete(id),
//         onSuccess: () => {
//             queryClient.invalidateQueries(['participants', groupId]);
//             toast.success('Deelnemer verwijderd');
//         },
//     });

//     const drawNamesMutation = useMutation({
//         mutationFn: async () => {
//             if (participants.length < 3) {
//                 throw new Error('Minimaal 3 deelnemers nodig');
//             }

//             // Shuffle algorithm - create assignments
//             const shuffled = [...participants];
//             let attempts = 0;
//             let validAssignment = false;
//             let assignments = [];

//             while (!validAssignment && attempts < 100) {
//                 attempts++;
//                 shuffled.sort(() => Math.random() - 0.5);

//                 // Check if anyone got themselves
//                 validAssignment = true;
//                 for (let i = 0; i < participants.length; i++) {
//                     if (participants[i].id === shuffled[i].id) {
//                         validAssignment = false;
//                         break;
//                     }
//                 }

//                 if (validAssignment) {
//                     assignments = participants.map((p, i) => ({
//                         id: p.id,
//                         assigned_to_id: shuffled[i].id,
//                         assigned_to_name: shuffled[i].name,
//                     }));
//                 }
//             }

//             if (!validAssignment) {
//                 throw new Error('Kon geen geldige loting maken');
//             }

//             // Update all participants
//             await Promise.all(
//                 assignments.map((a) =>
//                     base44.entities.Participant.update(a.id, {
//                         assigned_to_id: a.assigned_to_id,
//                         assigned_to_name: a.assigned_to_name,
//                     })
//                 )
//             );

//             // Mark group as drawn
//             await base44.entities.SecretSantaGroup.update(groupId, { is_drawn: true });
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries(['participants', groupId]);
//             queryClient.invalidateQueries(['group', groupId]);
//             toast.success('Loting succesvol uitgevoerd!');
//         },
//         onError: (error) => {
//             toast.error(error.message || 'Er ging iets mis');
//         },
//     });

//     if (groupLoading || participantsLoading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 flex items-center justify-center">
//                 <Loader2 className="w-8 h-8 animate-spin text-red-600" />
//             </div>
//         );
//     }

//     if (!group) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//                     <h2 className="text-2xl font-bold text-slate-800 mb-2">Groep niet gevonden</h2>
//                     <Button onClick={() => navigate('/Home')}>
//                         Terug naar overzicht
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-white relative overflow-hidden">
//             {/* Falling Snow */}
//             <div className="fixed inset-0 pointer-events-none z-50">
//                 {[...Array(20)].map((_, i) => (
//                     <div
//                         key={i}
//                         className="absolute text-white text-2xl animate-snow"
//                         style={{
//                             left: `${Math.random() * 100}%`,
//                             animationDelay: `${Math.random() * 5}s`,
//                             animationDuration: `${10 + Math.random() * 10}s`,
//                             opacity: 0.6
//                         }}
//                     >
//                         ❄
//                     </div>
//                 ))}
//             </div>

//             <div className="max-w-6xl mx-auto px-6 py-8 relative">
//                 {/* Header */}
//                 <motion.div
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="mb-8"
//                 >
//                     <Button
//                         variant="ghost"
//                         onClick={() => navigate('/Home')}
//                         className="mb-6 border-4 border-black font-black uppercase h-12 px-6 hover:bg-black hover:text-white"
//                     >
//                         <ArrowLeft className="w-5 h-5 mr-2" />
//                         Terug
//                     </Button>

//                     <div className="bg-white border-8 border-red-600 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 transform -rotate-1 relative overflow-hidden">
//                         <div className="absolute top-4 right-4 text-7xl opacity-20">🎄</div>
//                         <div className="absolute bottom-4 left-4 text-6xl opacity-20">⛄</div>
//                         <div className="transform rotate-1 relative z-10">
//                             <div className="flex items-center gap-4 mb-4">
//                                 <span className="text-6xl">🎁</span>
//                                 <h1 className="text-5xl md:text-7xl font-black uppercase leading-none">{group.name}</h1>
//                             </div>
//                             {group.description && (
//                                 <p className="text-xl font-bold mb-6 border-l-4 border-black pl-4">{group.description}</p>
//                             )}

//                             <div className="flex flex-wrap gap-3">
//                                 {group.budget_limit && (
//                                     <span className="px-4 py-2 bg-red-600 text-white border-4 border-black font-black uppercase text-sm">
//                                         💰 €{group.budget_limit}
//                                     </span>
//                                 )}
//                                 {group.event_date && (
//                                     <span className="px-4 py-2 bg-green-700 text-white border-4 border-black font-black uppercase text-sm">
//                                         🎄 {new Date(group.event_date).toLocaleDateString('nl-NL')}
//                                     </span>
//                                 )}
//                                 <span className={`px-4 py-2 border-4 border-black font-black uppercase text-sm ${group.is_drawn ? 'bg-white text-green-700' : 'bg-black text-white'
//                                     }`}>
//                                     {group.is_drawn ? '✓ Geloot ⭐' : '⏳ Wachten'}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>
//                 </motion.div>

//                 {/* Draw Status Alert */}
//                 {!group.is_drawn && participants.length >= 3 && (
//                     <Alert className="mb-6 border-8 border-black bg-green-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//                         <CheckCircle className="h-6 w-6" />
//                         <AlertDescription className="font-black uppercase text-lg">
//                             Klaar! {participants.length} mensen → Start loting!
//                         </AlertDescription>
//                     </Alert>
//                 )}

//                 {!group.is_drawn && participants.length < 3 && (
//                     <Alert className="mb-6 border-8 border-black bg-red-600 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//                         <AlertCircle className="h-6 w-6" />
//                         <AlertDescription className="font-black uppercase text-lg text-white">
//                             Let op! Minimaal 3 mensen nodig / nog {3 - participants.length} te gaan
//                         </AlertDescription>
//                     </Alert>
//                 )}

//                 {group.is_drawn && (
//                     <Alert className="mb-6 border-8 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
//                         <CheckCircle className="h-6 w-6" />
//                         <AlertDescription className="font-black uppercase text-lg">
//                             ✓ Loting compleet! Deel de links!
//                         </AlertDescription>
//                     </Alert>
//                 )}

//                 {/* Participants List */}
//                 <ParticipantList
//                     participants={participants}
//                     onAdd={(data) => addParticipantMutation.mutate(data)}
//                     onRemove={(id) => removeParticipantMutation.mutate(id)}
//                     isDrawn={group.is_drawn}
//                     groupId={groupId}
//                 />

//                 {/* Draw Button */}
//                 {!group.is_drawn && participants.length >= 3 && (
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         whileHover={{ scale: 1.02 }}
//                         className="mt-8"
//                     >
//                         <Button
//                             onClick={() => drawNamesMutation.mutate()}
//                             disabled={drawNamesMutation.isPending}
//                             size="lg"
//                             className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase border-8 border-black text-2xl py-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
//                         >
//                             {drawNamesMutation.isPending ? (
//                                 <>
//                                     <Loader2 className="w-8 h-8 mr-3 animate-spin" />
//                                     Bezig...
//                                 </>
//                             ) : (
//                                 <>
//                                     <Shuffle className="w-8 h-8 mr-3" />
//                                     Trek Lootjes Nu!
//                                 </>
//                             )}
//                         </Button>
//                     </motion.div>
//                 )}
//             </div>
//         </div>
//     );
// }