locals {
  az_count = length(var.azs)
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.name_prefix}-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.name_prefix}-igw"
  }
}

# --- Subnets ---

resource "aws_subnet" "public" {
  count                   = local.az_count
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.name_prefix}-public-${var.azs[count.index]}"
    Tier = "public"
  }
}

resource "aws_subnet" "app_private" {
  count             = local.az_count
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.app_private_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = {
    Name = "${var.name_prefix}-app-private-${var.azs[count.index]}"
    Tier = "app-private"
  }
}

resource "aws_subnet" "data_private" {
  count             = local.az_count
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.data_private_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = {
    Name = "${var.name_prefix}-data-private-${var.azs[count.index]}"
    Tier = "data-private"
  }
}

# --- NAT (single gateway in the first public subnet, toggled by var.enable_nat) ---

resource "aws_eip" "nat" {
  count  = var.enable_nat ? 1 : 0
  domain = "vpc"

  tags = {
    Name = "${var.name_prefix}-nat-eip"
  }
}

resource "aws_nat_gateway" "this" {
  count         = var.enable_nat ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "${var.name_prefix}-nat"
  }

  depends_on = [aws_internet_gateway.this]
}

# --- Route tables ---
# Public: internet-routable via the IGW.
# App-private: outbound-only via NAT (Docker Hub pulls, Gemini/Gmail calls) when enable_nat is true.
# Data-private: no internet route at all — RDS/DocumentDB never need outbound internet access.

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.name_prefix}-public-rt"
  }
}

resource "aws_route_table" "app_private" {
  vpc_id = aws_vpc.this.id

  dynamic "route" {
    for_each = var.enable_nat ? [1] : []
    content {
      cidr_block     = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.this[0].id
    }
  }

  tags = {
    Name = "${var.name_prefix}-app-private-rt"
  }
}

resource "aws_route_table" "data_private" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.name_prefix}-data-private-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = local.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "app_private" {
  count          = local.az_count
  subnet_id      = aws_subnet.app_private[count.index].id
  route_table_id = aws_route_table.app_private.id
}

resource "aws_route_table_association" "data_private" {
  count          = local.az_count
  subnet_id      = aws_subnet.data_private[count.index].id
  route_table_id = aws_route_table.data_private.id
}
