resource "aws_iam_role" "code_interpreter" {
  name = "${var.project}-code-interpreter"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "bedrock-agentcore.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "code_interpreter_s3" {
  name = "s3-get-object"
  role = aws_iam_role.code_interpreter.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.data.arn}/*"
    }]
  })
}

resource "aws_bedrockagentcore_code_interpreter" "main" {
  depends_on = [aws_iam_role.code_interpreter]
  name        = replace("${var.project}_code_interpreter", "-", "_")
  description = "Code interpreter sandbox for data extraction"

  execution_role_arn = aws_iam_role.code_interpreter.arn

  network_configuration {
    network_mode = "SANDBOX"
  }
}
