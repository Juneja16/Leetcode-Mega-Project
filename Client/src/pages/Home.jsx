import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router";
import { logoutUser } from "../store/authSlice";
import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { PROBLEM_TAGS } from "../constants/tags";

// const Home = () => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   const handleLogout = () => {
//     dispatch(logoutUser());
//   };
//   return (
//     <div className="min-h-screen bg-base-200">
//       {/* Navigation Bar */}
//       <nav className="navbar bg-base-100 shadow-lg px-4">
//         <div className="flex-1">
//           <NavLink to="/" className="btn btn-ghost text-xl">
//             LeetCode
//           </NavLink>
//         </div>
//         <div className="flex-none gap-4">
//           <div className="dropdown dropdown-end">
//             <div tabIndex={0} className="btn btn-ghost">
//               {user?.firstName}
//             </div>
//             <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
//               <li>
//                 <button onClick={handleLogout}>Logout</button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>
//     </div>
//   );
// };

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  // const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axiosClient.get("/problem/getAllProblems");
        console.log("Full response:", response);
        console.log("Problems data:", response.data.problems);
        console.log("Is array?", Array.isArray(response.data.problems));

        const { problems } = response.data;
        setProblems(problems);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    fetchProblems();
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    // setSolvedProblems([]); // Clear solved problems on logout
  };

  const filteredProblems = Array.isArray(problems)
    ? problems.filter((problem) => {
        const difficultyMatch =
          filters.difficulty === "all" ||
          problem.difficultyLevel === filters.difficulty;
        const tagMatch =
          filters.tag === "all" ||
          (problem.tags && problem.tags.includes(filters.tag));
        const statusMatch = filters.status === "all";
        return difficultyMatch && tagMatch && statusMatch;
      })
    : [];

  const formatTag = (tag) => {
    if (!tag) return "";
    return tag
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg px-4">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-xl">
            LeetCode
          </NavLink>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-ghost">
              {user?.firstName}
            </div>
            <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* New Status Filter */}
          {/* <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select> */}
          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            {PROBLEM_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {formatTag(tag)}
              </option>
            ))}
          </select>
        </div>

        {/* Problems List */}
        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <div key={problem._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="hover:text-primary"
                    >
                      {problem.title}
                    </NavLink>
                  </h2>
                  {/* {solvedProblems.some((sp) => sp._id === problem._id) && (
                    <div className="badge badge-success gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Solved
                    </div>
                  )} */}
                </div>

                <div className="flex gap-2">
                  <div
                    className={`badge ${getDifficultyBadgeColor(
                      problem.difficultyLevel
                    )}`}
                  >
                    {formatTag(problem.difficultyLevel)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags &&
                      problem.tags.map((tag, index) => (
                        <div key={index} className="badge badge-info">
                          {formatTag(tag)}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

export default Home;

/*  1.“When the page opens, fetch all problems. 
    2.If the user is logged in, also fetch the problems they’ve solved.
    3.Show all problems (or filtered ones) on the page.
    4.Highlight solved ones with a green badge.
    5.If the user changes filters, the list updates live.
    6. If they log out, solved problems are cleared.” 
    */
