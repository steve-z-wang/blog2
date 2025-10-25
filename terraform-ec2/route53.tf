# Use existing Route53 hosted zone
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# A record for api subdomain pointing to EC2
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [aws_eip.blog.public_ip]
}
