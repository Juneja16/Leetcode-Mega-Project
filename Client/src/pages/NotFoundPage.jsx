import { NavLink } from "react-router";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-5xl font-bold text-error">404</h2>
          <p className="text-gray-500 mt-2">
            The page you are looking for does not exist.
          </p>

          <div className="mt-6">
            <NavLink to="/" className="btn btn-primary w-full">
              Go Back Home
            </NavLink>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Maybe try searching for a valid problem next time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
