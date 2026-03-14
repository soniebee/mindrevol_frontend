// import React, { useState } from 'react';
// import MainLayout from '@/components/layout/MainLayout';
// import { Search, UserPlus, Check, Loader2 } from 'lucide-react';
// import { userService, UserSummary } from '../services/user.service';
// import { useAuth } from '@/modules/auth/store/AuthContext';

// const DiscoveryPage = () => {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState<UserSummary[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [sentRequests, setSentRequests] = useState<number[]>([]); // Lưu ID các user đã gửi lời mời tạm thời

//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!query.trim()) return;
    
//     setIsLoading(true);
//     try {
//       const data = await userService.searchUsers(query);
//       setResults(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddFriend = async (userId: number) => {
//     try {
//       await userService.sendFriendRequest(userId);
//       setSentRequests(prev => [...prev, userId]); // Đánh dấu đã gửi
//     } catch (error) {
//       alert("Không thể gửi lời mời.");
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="min-h-screen w-full bg-[#121212] flex flex-col items-center pt-24 px-4">
        
//         <div className="w-full max-w-2xl flex flex-col gap-8">
//           {/* Header */}
//           <div className="text-center space-y-2">
//             <h1 className="text-3xl font-bold text-white">Tìm kiếm bạn bè</h1>
//             <p className="text-zinc-400">Kết nối với những người cùng chí hướng để bắt đầu hành trình.</p>
//           </div>

//           {/* Search Bar */}
//           <form onSubmit={handleSearch} className="relative group">
//             <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
//             <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-full px-6 py-4 shadow-xl focus-within:border-blue-500/50 transition-all">
//               <Search className="w-6 h-6 text-zinc-500 mr-4" />
//               <input 
//                 type="text" 
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Nhập tên, email hoặc ID người dùng..."
//                 className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-zinc-600"
//                 autoFocus
//               />
//               {isLoading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
//             </div>
//           </form>

//           {/* Results List */}
//           <div className="flex flex-col gap-4">
//             {results.length > 0 ? (
//               results.map(user => (
//                 <div key={user.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
//                   <div className="flex items-center gap-4">
//                     <img src={user.avatarUrl || 'https://i.pravatar.cc/150?u=def'} alt={user.fullname} className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
//                     <div>
//                       <h4 className="text-white font-bold">{user.fullname}</h4>
//                       <p className="text-zinc-500 text-sm">@{user.handle || 'user'}</p>
//                     </div>
//                   </div>
                  
//                   {sentRequests.includes(user.id) || user.friendshipStatus === 'PENDING' ? (
//                     <button disabled className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-full text-sm font-bold flex items-center gap-2 cursor-default">
//                       <Check className="w-4 h-4" /> Đã gửi
//                     </button>
//                   ) : user.friendshipStatus === 'ACCEPTED' ? (
//                     <button disabled className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-bold flex items-center gap-2 cursor-default">
//                       Bạn bè
//                     </button>
//                   ) : (
//                     <button 
//                       onClick={() => handleAddFriend(user.id)}
//                       className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold flex items-center gap-2 transition-colors"
//                     >
//                       <UserPlus className="w-4 h-4" /> Kết bạn
//                     </button>
//                   )}
//                 </div>
//               ))
//             ) : (
//               !isLoading && query && <div className="text-center text-zinc-500 mt-10">Không tìm thấy ai.</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default DiscoveryPage;