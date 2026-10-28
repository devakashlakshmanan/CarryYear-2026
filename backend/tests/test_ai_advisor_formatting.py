import pytest
from app.services.ai_advisor_service import AIAdvisorService

def test_format_ai_response_html_line_breaks():
    # Test HTML line breaks like <br>, <br/>, <br />
    input_text = "Welcome to CarryYear!<br>Here is your advice:<br/>Point 1<br />Point 2"
    result = AIAdvisorService._format_ai_response(input_text)
    assert "<br>" not in result
    assert "<br/>" not in result
    assert "<br />" not in result
    assert "Welcome to CarryYear!\nHere is your advice:\nPoint 1\nPoint 2" in result

def test_format_ai_response_untrusted_html():
    # Test that untrusted or raw HTML tags are safely stripped
    input_text = "<script>alert('xss')</script><b>Bold Text</b> <div>Some block</div>"
    result = AIAdvisorService._format_ai_response(input_text)
    assert "<script>" not in result
    assert "</script>" not in result
    assert "<div>" not in result
    assert "Bold Text Some block" in result

def test_format_ai_response_markdown_tables():
    # Test markdown table preservation and blank line padding
    input_text = """Below is the cutoff table:
| College | Branch | Cutoff |
|---|---|---|
| CEG Guindy | Computer Science | 199.0 |
| MIT Chromepet | Information Technology | 197.5 |"""
    result = AIAdvisorService._format_ai_response(input_text)
    assert "| College | Branch | Cutoff |" in result
    assert "| CEG Guindy | Computer Science | 199.0 |" in result
    # Ensure there is a blank line before the table
    assert "Below is the cutoff table:\n\n|" in result

def test_format_ai_response_bullet_and_numbered_lists():
    # Test bullet points, bold text, and numbered lists
    input_text = """Key Steps:
1. Apply for TNEA Single Window Counseling
2. Prepare First Graduate certificate
* Maintain high cut-off
* Choose top Anna University affiliated colleges"""
    result = AIAdvisorService._format_ai_response(input_text)
    assert "1. Apply for TNEA Single Window Counseling" in result
    assert "2. Prepare First Graduate certificate" in result
    assert "* Maintain high cut-off" in result
    assert "* Choose top Anna University affiliated colleges" in result

def test_format_ai_response_plain_text():
    # Test plain text preserves paragraph spacing and doesn't get corrupted
    input_text = "Just a simple single-paragraph advice for the student."
    result = AIAdvisorService._format_ai_response(input_text)
    assert result == "Just a simple single-paragraph advice for the student."
