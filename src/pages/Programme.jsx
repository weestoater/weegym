function Programme() {
  const programmeData = {
    client: {
      name: "Ian Burrett",
      instructor: "Adam",
      date: "31/01/26",
      review: "Intro",
    },
    day1: {
      name: "Day 1 - Upper Body",
      description: "Push Focus: Chest, Shoulders, Triceps",
      target: "Chest • Shoulders • Arms",
      exercises: [
        {
          name: "Chest Press",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "90s",
        },
        {
          name: "Lat Pulldown",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "90s",
        },
        {
          name: "Shoulder Press",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "90s",
        },
        {
          name: "Bicep Curls",
          type: "Free-weights",
          sets: 3,
          reps: "10-12",
          rest: "60s",
        },
        {
          name: "Tricep Extensions",
          type: "Free-weights",
          sets: 3,
          reps: "10-12",
          rest: "60s",
        },
      ],
    },
    day2: {
      name: "Day 2 - Lower Body",
      description: "Legs, Glutes & Core Strength",
      target: "Legs • Glutes • Core",
      exercises: [
        {
          name: "Leg Press",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "120s",
        },
        {
          name: "Leg Curl",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "90s",
        },
        {
          name: "Leg Extension",
          type: "Machine",
          sets: 3,
          reps: "10-12",
          rest: "90s",
        },
        {
          name: "Calf Raises",
          type: "Machine",
          sets: 3,
          reps: "12-15",
          rest: "60s",
        },
        {
          name: "Plank",
          type: "Free-weights",
          sets: 3,
          reps: "30-60s",
          rest: "60s",
        },
      ],
    },
  };

  return (
    <div className="container mt-4">
      {/* Header Info */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="h5 mb-3">Programme Details</h2>
          <div className="row g-2 small">
            <div className="col-6">
              <span className="text-muted">Client:</span>
              <p className="mb-0 fw-bold">{programmeData.client.name}</p>
            </div>
            <div className="col-6">
              <span className="text-muted">Instructor:</span>
              <p className="mb-0 fw-bold">{programmeData.client.instructor}</p>
            </div>
            <div className="col-6">
              <span className="text-muted">Start Date:</span>
              <p className="mb-0 fw-bold">{programmeData.client.date}</p>
            </div>
            <div className="col-6">
              <span className="text-muted">Phase:</span>
              <p className="mb-0 fw-bold">{programmeData.client.review}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Concepts */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="h6 mb-0">
            <i className="bi bi-lightbulb me-2"></i>
            Key Concepts
          </h3>
        </div>
        <div className="card-body">
          <h4 className="h6 fw-bold">Progressive Overload</h4>
          <p className="small mb-3">
            Gradually increase intensity over time. Once you hit the top of the
            rep range, increase the weight slightly.
          </p>
          <h4 className="h6 fw-bold">Time Under Tension</h4>
          <p className="small mb-0">
            Maintain control: 2 seconds up (concentric), 2 seconds down
            (eccentric). This maximizes muscle growth.
          </p>
        </div>
      </div>

      {/* Day 1 */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="h6 mb-0">{programmeData.day1.name}</h3>
          <small className="opacity-75">{programmeData.day1.target}</small>
        </div>
        <div className="list-group list-group-flush">
          {programmeData.day1.exercises.map((exercise, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 className="h6 mb-1">{exercise.name}</h4>
                  <span className="badge bg-secondary small">
                    {exercise.type}
                  </span>
                </div>
                <div className="text-end">
                  <p className="mb-0 small">
                    {exercise.sets} × {exercise.reps}
                  </p>
                  <p className="mb-0 text-muted small">Rest: {exercise.rest}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day 2 */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h3 className="h6 mb-0">{programmeData.day2.name}</h3>
          <small className="opacity-75">{programmeData.day2.target}</small>
        </div>
        <div className="list-group list-group-flush">
          {programmeData.day2.exercises.map((exercise, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 className="h6 mb-1">{exercise.name}</h4>
                  <span className="badge bg-secondary small">
                    {exercise.type}
                  </span>
                </div>
                <div className="text-end">
                  <p className="mb-0 small">
                    {exercise.sets} × {exercise.reps}
                  </p>
                  <p className="mb-0 text-muted small">Rest: {exercise.rest}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="alert alert-info" role="alert">
        <h4 className="h6 fw-bold mb-2">
          <i className="bi bi-info-circle me-2"></i>
          Important Notes
        </h4>
        <ul className="mb-0 small">
          <li>Follow this plan for ~1 month to build a foundation</li>
          <li>Take rest days between sessions</li>
          <li>Complete sessions 2-4 times per week</li>
          <li>Do cardio at the END of your session</li>
          <li>Always warm up and cool down</li>
        </ul>
      </div>
    </div>
  );
}

export default Programme;
