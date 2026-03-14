// import React, { useEffect, useState } from 'react';
// import MainLayout from '@/components/layout/MainLayout';
// import { blockService } from '../services/block.service';
// import { UserSummary } from '../services/user.service';
// import { Unlock, ShieldOff, Loader2 } from 'lucide-react';

// const BlockListPage = () => {
//   const [blockedUsers, setBlockedUsers] = useState<UserSummary[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const data = await blockService.getBlockedUsers();
//       setBlockedUsers(data);
//     } catch (error) {
//       console.error("Lỗi tải danh sách chặn", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUnblock = async (userId: number) => {
//     if (!confirm('Bạn có chắc muốn bỏ chặn người này?')) return;
//     try {
//       await blockService.unblockUser(userId);
//       setBlockedUsers(prev => prev.filter(u => u.id !== userId));
//     } catch (error) {
//       alert('Có lỗi xảy ra khi bỏ chặn.');
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="min-h-screen pt-24 px-4 max-w-2xl mx-auto w-full">
//         <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
//           <ShieldOff className="text-red-500" />
//           Danh sách chặn
//         </h1>

//         {loading ? (
//           <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-500" /></div>
//         ) : blockedUsers.length === 0 ? (
//           <div className="text-zinc-500 bg-white/5 p-8 rounded-xl text-center border border-white/5">
//             Bạn chưa chặn ai cả.
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {blockedUsers.map(user => (
//               <div key={user.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-white/10 rounded-xl">
//                 <div className="flex items-center gap-3">
//                   <img 
//                     src={user.avatarUrl || 'https://i.pravatar.cc/150?u=def'} 
//                     alt={user.fullname}
//                     className="w-10 h-10 rounded-full object-cover" 
//                   />
//                   <div>
//                     <h3 className="font-bold text-white text-sm">{user.fullname}</h3>
//                     <p className="text-xs text-zinc-500">@{user.handle}</p>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => handleUnblock(user.id)}
//                   className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors border border-white/5"
//                 >
//                   <Unlock className="w-3.5 h-3.5" /> Bỏ chặn
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// };

// export default BlockListPage;