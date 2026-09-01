import json
import os
from datetime import UTC, datetime

OFFICIAL_ID = '123e4567-e89b-12d3-a456-426614174000'
COURSE_ID = 'course-igot-101'
QUIZ_ID = 'quiz-stats-01'


def write_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)


def seed_data():
    # 1. framework.json
    framework = {
        'skills': [
            {
                'skill': 'Python for Data Analysis',
                'domain': 'digital_tools',
                'required_by_role': {'Data Scientist': 4, 'Analyst': 3},
            },
            {
                'skill': 'Statistical Inference',
                'domain': 'statistical_methods',
                'required_by_role': {'Data Scientist': 4, 'Analyst': 2},
            },
        ]
    }
    write_json('data/dummy/framework.json', framework)

    # 2. profiles.json
    profiles = [
        {
            'official_id': OFFICIAL_ID,
            'role': 'Analyst',
            'dept': 'Statistics',
            'education': 'M.Sc. Statistics',
            'experience_years': 3,
            'past_trainings': [
                {'course_name': 'Basic Python', 'completed_at': datetime.now(UTC).isoformat()}
            ],
            'profile_stored': True,
            'graph_node_added': True,
            'initial_levels': {'digital_tools': 1, 'statistical_methods': 2},
        }
    ]
    write_json('data/dummy/profiles.json', profiles)

    # 3. courses.json
    courses = [
        {
            'course_id': COURSE_ID,
            'title': 'Advanced Python Analytics',
            'provider': 'iGOT',
            'duration_hours': 10,
        },
        {
            'course_id': 'course-nssta-01',
            'title': 'Applied Statistics',
            'provider': 'NSSTA',
            'duration_hours': 20,
        },
    ]
    write_json('data/dummy/courses.json', courses)

    # 4. quizzes.json
    quizzes = [
        {
            'quiz_id': QUIZ_ID,
            'source_filename': 'sample_stats.pdf',
            'questions': [
                {
                    'q': 'What is a p-value?',
                    'options': [
                        'Probability of null given data',
                        'Probability of data given null',
                        'A test statistic',
                        'Power of the test',
                    ],
                    'correct': 1,
                    'explanation': 'A p-value is the probability of observing data as extreme as yours, assuming the null hypothesis is true.',
                }
            ],
        }
    ]
    write_json('data/dummy/quizzes.json', quizzes)

    # 5. employee_dashboard.json
    employee_dash = {
        'official_id': OFFICIAL_ID,
        'gaps': [
            {
                'skill': 'Python for Data Analysis',
                'domain': 'digital_tools',
                'required': 3,
                'current': 1,
                'gap': 2,
            }
        ],
        'recommended': [
            {
                'course': 'Advanced Python Analytics',
                'course_id': COURSE_ID,
                'relevance': 0.95,
                'why': 'Directly addresses your gap in Python.',
            }
        ],
        'latest_grading': {
            'quiz_id': QUIZ_ID,
            'score': 100.0,
            'feedback': [
                {
                    'q': 'What is a p-value?',
                    'your_answer': 1,
                    'correct': 1,
                    'is_correct': True,
                    'explanation': 'Correct!',
                }
            ],
        },
    }
    write_json('frontend/mock_data/employee_dashboard.json', employee_dash)

    # 6. admin_dashboard.json
    admin_dash = {
        'total_officials': 500,
        'domain_aggregates': [
            {'domain': 'digital_tools', 'avg_gap': 1.2, 'officials_below_target': 150},
            {'domain': 'statistical_methods', 'avg_gap': 0.5, 'officials_below_target': 50},
        ],
        'top_recommended_courses': ['Advanced Python Analytics', 'Applied Statistics'],
    }
    write_json('frontend/mock_data/admin_dashboard.json', admin_dash)
    print('Dummy data seeded natively.')


seed_data()
