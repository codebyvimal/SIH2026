from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

output_path = Path('data/dummy/sample_pdfs/sample_stats.pdf')
output_path.parent.mkdir(parents=True, exist_ok=True)

doc = SimpleDocTemplate(str(output_path), pagesize=letter)
styles = getSampleStyleSheet()
story = []

story.append(Paragraph('Introduction to Statistical Inference', styles['Title']))
story.append(Spacer(1, 12))

content = [
    (
        'What is a p-value?',
        'A p-value is the probability of obtaining test results at least as extreme '
        'as the observed results, assuming the null hypothesis is true. A low p-value '
        '(typically < 0.05) suggests strong evidence against the null hypothesis.',
    ),
    (
        'Hypothesis Testing',
        'Hypothesis testing is a statistical method used to make decisions about a '
        'population based on sample data. It involves a null hypothesis (H0) and an '
        'alternative hypothesis (H1). The test statistic measures how far the sample '
        'data falls from the null hypothesis value.',
    ),
    (
        'Type I and Type II Errors',
        'A Type I error (false positive) occurs when we reject a true null hypothesis. '
        'Its probability is denoted by alpha (significance level). A Type II error '
        '(false negative) occurs when we fail to reject a false null hypothesis. '
        'Its probability is denoted by beta. Statistical power = 1 - beta.',
    ),
    (
        'Confidence Intervals',
        'A confidence interval gives a range of plausible values for a population '
        'parameter. A 95% confidence interval means that if we repeated the sampling '
        'procedure many times, 95% of the intervals would contain the true parameter.',
    ),
]

for heading, body in content:
    story.append(Paragraph(heading, styles['Heading2']))
    story.append(Paragraph(body, styles['Normal']))
    story.append(Spacer(1, 12))

doc.build(story)
print(f'Created {output_path}')
