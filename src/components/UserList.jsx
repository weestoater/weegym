import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getAllUserProfiles } from "../services/userProfileService";

function UserList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUserProfiles();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users. You may not have admin permissions.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.display_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.instructor_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading users...</span>
        </div>
        <p className="mt-2">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 mb-0">
          <i className="bi bi-people me-2"></i>
          All Users ({users.length})
        </h3>
        <button className="btn btn-sm btn-outline-secondary" onClick={loadUsers}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email, or instructor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Display Name</th>
              <th>Email</th>
              <th>Instructor</th>
              <th>Programme Phase</th>
              <th>Experience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  {searchTerm
                    ? "No users found matching your search"
                    : "No users found"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.display_name}</strong>
                    {user.is_admin && (
                      <span className="badge bg-danger ms-2">Admin</span>
                    )}
                  </td>
                  <td>
                    <small className="text-muted">{user.email}</small>
                  </td>
                  <td>{user.instructor_name || "-"}</td>
                  <td>
                    <span className="badge bg-info">
                      {user.programme_phase || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {user.experience_level || "N/A"}
                    </span>
                  </td>
                  <td>
                    {user.is_active ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onSelectUser(user)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > 0 && searchTerm && (
        <div className="text-muted text-center mt-2">
          <small>
            Showing {filteredUsers.length} of {users.length} users
          </small>
        </div>
      )}
    </div>
  );
}

UserList.propTypes = {
  onSelectUser: PropTypes.func.isRequired,
};

export default UserList;
