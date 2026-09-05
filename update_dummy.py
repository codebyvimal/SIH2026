import json
import uuid
import datetime

framework = {
  "skills": [
    {
      "skill": "Python for Data Analysis",
      "domain": "digital_tools",
      "required_by_role": {
        "Data Scientist": 4,
        "Analyst": 3,
        "Engineer": 2,
        "Manager": 1
      }
    },
    {
      "skill": "R Programming",
      "domain": "digital_tools",
      "required_by_role": {
        "Data Scientist": 4,
        "Analyst": 4,
        "Manager": 1
      }
    },
    {
      "skill": "SQL",
      "domain": "digital_tools",
      "required_by_role": {
        "Data Scientist": 3,
        "Analyst": 4,
        "Engineer": 4,
        "Manager": 2
      }
    },
    {
      "skill": "Statistical Inference",
      "domain": "statistical_methods",
      "required_by_role": {
        "Data Scientist": 4,
        "Analyst": 3,
        "Manager": 2
      }
    },
    {
      "skill": "Machine Learning",
      "domain": "statistical_methods",
      "required_by_role": {
        "Data Scientist": 4,
        "Analyst": 1,
        "Engineer": 2
      }
    },
    {
      "skill": "Predictive Modeling",
      "domain": "statistical_methods",
      "required_by_role": {
        "Data Scientist": 4,
        "Analyst": 2
      }
    },
    {
      "skill": "Data Cleaning",
      "domain": "data_management",
      "required_by_role": {
        "Data Scientist": 3,
        "Analyst": 4,
        "Engineer": 3
      }
    },
    {
      "skill": "Database Administration",
      "domain": "data_management",
      "required_by_role": {
        "Engineer": 4,
        "Manager": 1
      }
    },
    {
      "skill": "Data Pipeline Design",
      "domain": "data_management",
      "required_by_role": {
        "Data Scientist": 2,
        "Engineer": 4
      }
    },
    {
      "skill": "Public Policy",
      "domain": "domain_knowledge",
      "required_by_role": {
        "Analyst": 3,
        "Manager": 4
      }
    },
    {
      "skill": "Economic Indicators",
      "domain": "domain_knowledge",
      "required_by_role": {
        "Data Scientist": 2,
        "Analyst": 4,
        "Manager": 3
      }
    },
    {
      "skill": "Healthcare Statistics",
      "domain": "domain_knowledge",
      "required_by_role": {
        "Data Scientist": 3,
        "Analyst": 3,
        "Manager": 2
      }
    }
  ]
}

with open("data/dummy/framework.json", "w") as f:
    json.dump(framework, f, indent=2)

profiles = [
  {
    "official_id": "123e4567-e89b-12d3-a456-426614174000",
    "role": "Analyst",
    "dept": "Statistics",
    "education": "M.Sc. Statistics",
    "experience_years": 3,
    "past_trainings": [
      {
        "course_name": "Basic Python",
        "completed_at": "2026-08-31T19:32:42.754641"
      }
    ],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 1,
      "statistical_methods": 2,
      "data_management": 1,
      "domain_knowledge": 2
    }
  },
  {
    "official_id": str(uuid.uuid4()),
    "role": "Data Scientist",
    "dept": "AI Research",
    "education": "Ph.D. Computer Science",
    "experience_years": 5,
    "past_trainings": [
      {
        "course_name": "Advanced Machine Learning",
        "completed_at": "2025-11-15T10:00:00.000000"
      }
    ],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 4,
      "statistical_methods": 4,
      "data_management": 3,
      "domain_knowledge": 1
    }
  },
  {
    "official_id": str(uuid.uuid4()),
    "role": "Engineer",
    "dept": "Data Engineering",
    "education": "B.Tech Computer Science",
    "experience_years": 2,
    "past_trainings": [
      {
        "course_name": "Database Internals",
        "completed_at": "2026-02-20T14:30:00.000000"
      }
    ],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 3,
      "statistical_methods": 1,
      "data_management": 4,
      "domain_knowledge": 1
    }
  },
  {
    "official_id": str(uuid.uuid4()),
    "role": "Manager",
    "dept": "Public Policy",
    "education": "MBA",
    "experience_years": 10,
    "past_trainings": [],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 1,
      "statistical_methods": 1,
      "data_management": 1,
      "domain_knowledge": 4
    }
  },
  {
    "official_id": str(uuid.uuid4()),
    "role": "Analyst",
    "dept": "Economics",
    "education": "M.A. Economics",
    "experience_years": 1,
    "past_trainings": [
      {
        "course_name": "Intro to Economics",
        "completed_at": "2026-05-10T09:00:00.000000"
      }
    ],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 2,
      "statistical_methods": 3,
      "data_management": 1,
      "domain_knowledge": 3
    }
  },
  {
    "official_id": str(uuid.uuid4()),
    "role": "Data Scientist",
    "dept": "Healthcare",
    "education": "M.S. Bioinformatics",
    "experience_years": 4,
    "past_trainings": [
      {
        "course_name": "Bio-Statistics",
        "completed_at": "2024-08-11T12:00:00.000000"
      }
    ],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 3,
      "statistical_methods": 3,
      "data_management": 2,
      "domain_knowledge": 3
    }
  },
  {
    "official_id": str(uuid.uuid4()),
    "role": "Engineer",
    "dept": "Cloud Infrastructure",
    "education": "B.Sc. IT",
    "experience_years": 6,
    "past_trainings": [
      {
        "course_name": "AWS Certified Solutions Architect",
        "completed_at": "2023-01-22T10:00:00.000000"
      }
    ],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 4,
      "statistical_methods": 0,
      "data_management": 4,
      "domain_knowledge": 0
    }
  },
  {
    "official_id": str(uuid.uuid4()),
    "role": "Analyst",
    "dept": "Data Analytics",
    "education": "B.Sc. Statistics",
    "experience_years": 2,
    "past_trainings": [
      {
        "course_name": "Data Visualization with Tableau",
        "completed_at": "2025-06-15T16:45:00.000000"
      }
    ],
    "profile_stored": True,
    "graph_node_added": True,
    "initial_levels": {
      "digital_tools": 3,
      "statistical_methods": 2,
      "data_management": 2,
      "domain_knowledge": 1
    }
  }
]

with open("data/dummy/profiles.json", "w") as f:
    json.dump(profiles, f, indent=2)

