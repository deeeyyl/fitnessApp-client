import { useEffect, useState } from "react";

function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({ name: "", duration: "", status: "Planned" });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const API = "https://fitnessapp-api-ln8u.onrender.com/workouts";

  useEffect(() => {
    fetch(`${API}/getMyWorkouts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setWorkouts(data.workouts.reverse()))
      .catch(() => setMessage("⚠️ Failed to load workouts"));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/addWorkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const newWorkout = await res.json();

      if (res.ok) {
        setWorkouts([newWorkout, ...workouts]);
        setForm({ name: "", duration: "", status: "Planned" });
        setMessage("Workout added!");
      } else {
        setMessage(newWorkout.message || "Failed to add workout.");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }
  }

  async function handleUpdate(id) {
    const newName = prompt("Enter new workout name:");
    const newDuration = prompt("Enter new duration (minutes):");

    if (!newName || !newDuration) return;

    const res = await fetch(`${API}/updateWorkout/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName, duration: newDuration }),
    });

    const data = await res.json();
    if (res.ok) {
      setWorkouts(workouts.map((w) => (w._id === id ? data.updatedWorkout : w)));
      setMessage("Workout updated!");
    } else {
      setMessage(data.message || "Failed to update workout.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this workout?")) return;

    const res = await fetch(`${API}/deleteWorkout/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setWorkouts(workouts.filter((w) => w._id !== id));
      setMessage("🗑 Workout deleted.");
    } else {
      setMessage(data.message || "Failed to delete workout.");
    }
  }

  async function handleComplete(id) {
    const res = await fetch(`${API}/completeWorkout/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setWorkouts(workouts.map((w) => (w._id === id ? data.workout : w)));
      setMessage("🏆 Workout marked as completed!");
    } else {
      setMessage(data.message || "Failed to complete workout.");
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-3">My Workouts</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Workout Name</label>
            <input
              type="text"
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Duration (min)</label>
            <input
              type="number"
              className="form-control"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Planned</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="col-md-2">
            <button id="addWorkout" type="submit" className="btn btn-success w-100">
              Add Workout
            </button>
          </div>
        </div>
      </form>

      {workouts.length === 0 ? (
        <p className="text-muted">No workouts yet. Add one above 👆</p>
      ) : (
        <div className="row">
          {workouts.map((w) => (
            <div className="col-md-4 mb-3" key={w._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{w.name}</h5>
                  <p className="card-text">⏱ {w.duration} min</p>
                  <span
                    className={`badge ${
                      w.status === "Completed" ? "bg-success" : "bg-warning text-dark"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleUpdate(w._id)}
                  >
                    ✏️ Update
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleComplete(w._id)}
                    disabled={w.status === "Completed"}
                  >
                    ✅ Complete
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(w._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkoutsPage;