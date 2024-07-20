// import Post from "./Post";
// import PostSkeleton from "../skeletons/PostSkeleton";
// import { useQuery } from "@tanstack/react-query";
// import { useEffect } from "react";

// const Posts = ({ feedType, username, userId }) => {
//   const getPostEndpoint = () => {
//     switch (feedType) {
//       case "forYou":
//         return "/api/posts/all";
//       case "following":
//         return "/api/posts/following";
//       default:
//         return "/api/posts/all";
//     }
//   };

//   const POST_ENDPOINT = getPostEndpoint();

//   const { data, isLoading, refetch, isRefetching } = useQuery({
//     queryKey: ["posts", feedType, username],
//     queryFn: async () => {
//       const res = await fetch(POST_ENDPOINT);
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Something went wrong");
//       }
//       const data = await res.json();
//       return data;
//     },
//   });

//   useEffect(() => {
//     refetch();
//   }, [feedType, refetch, username]);

//   useEffect(() => {
//     console.log("Posts data: ", data);
//     console.log("Is Loading: ", isLoading);
//     console.log("Is Refetching: ", isRefetching);
//   }, [data, isLoading, isRefetching]);

//   const posts = data?.posts || [];

//   return (
//     <>
//       {(isLoading || isRefetching) && (
//         <div className="flex flex-col justify-center">
//           <PostSkeleton />
//           <PostSkeleton />
//           <PostSkeleton />
//         </div>
//       )}
//       {!isLoading &&
//         !isRefetching &&
//         Array.isArray(posts) &&
//         posts.length === 0 && (
//           <p className="text-center my-4">No posts in this tab. Switch 👻</p>
//         )}
//       {!isLoading && !isRefetching && Array.isArray(posts) && (
//         <div>
//           {posts.map((post) => (
//             <Post key={post._id} post={post} />
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

// export default Posts;
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";

const Posts = () => {
  const isLoading = false;

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && POSTS?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && POSTS && (
        <div>
          {POSTS.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
