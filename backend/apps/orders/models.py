from django.db import models
from django.contrib.auth.models import User
from apps.products.models import Product

class Cart(models.Model):
    """장바구니"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='사용자')
    created_at = models.DateTimeField('생성일', auto_now_add=True)
    updated_at = models.DateTimeField('수정일', auto_now=True)
    
    class Meta:
        verbose_name = '장바구니'
        verbose_name_plural = '장바구니 목록'
    
    def __str__(self):
        return f"{self.user.username}의 장바구니"
    
    def get_total(self):
        """총 금액 계산"""
        return sum(item.get_subtotal() for item in self.items.all())


class CartItem(models.Model):
    """장바구니 아이템"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', verbose_name='장바구니')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='제품')
    quantity = models.PositiveIntegerField('수량', default=1)
    created_at = models.DateTimeField('추가일', auto_now_add=True)
    
    class Meta:
        verbose_name = '장바구니 아이템'
        verbose_name_plural = '장바구니 아이템 목록'
        unique_together = ['cart', 'product']
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    def get_subtotal(self):
        """소계 계산"""
        return self.product.price * self.quantity


class Order(models.Model):
    """주문"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='주문자')
    order_number = models.CharField('주문번호', max_length=100, unique=True)
    
    # 배송 정보
    recipient_name = models.CharField('수령인', max_length=100)
    phone = models.CharField('전화번호', max_length=20)
    address = models.TextField('주소')
    postal_code = models.CharField('우편번호', max_length=10)
    delivery_memo = models.TextField('배송 메모', blank=True)
    
    # 주문 상태
    STATUS_CHOICES = [
        ('pending', '결제 대기'),
        ('paid', '결제 완료'),
        ('processing', '상품 준비중'),
        ('shipped', '배송중'),
        ('delivered', '배송 완료'),
        ('cancelled', '주문 취소'),
    ]
    status = models.CharField('주문 상태', max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # 금액
    subtotal = models.DecimalField('상품 금액', max_digits=10, decimal_places=0)
    shipping_fee = models.DecimalField('배송비', max_digits=10, decimal_places=0, default=0)
    discount = models.DecimalField('할인 금액', max_digits=10, decimal_places=0, default=0)
    total = models.DecimalField('총 금액', max_digits=10, decimal_places=0)
    
    # 포인트
    points_used = models.IntegerField('사용 포인트', default=0)
    points_earned = models.IntegerField('적립 포인트', default=0)
    
    created_at = models.DateTimeField('주문일', auto_now_add=True)
    updated_at = models.DateTimeField('수정일', auto_now=True)
    
    class Meta:
        verbose_name = '주문'
        verbose_name_plural = '주문 목록'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.order_number} - {self.user.username}"


class OrderItem(models.Model):
    """주문 아이템"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='주문')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='제품')
    product_name = models.CharField('제품명', max_length=200)
    price = models.DecimalField('가격', max_digits=10, decimal_places=0)
    quantity = models.PositiveIntegerField('수량')
    
    class Meta:
        verbose_name = '주문 아이템'
        verbose_name_plural = '주문 아이템 목록'
    
    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
    
    def get_subtotal(self):
        """소계"""
        return self.price * self.quantity


class Payment(models.Model):
    """결제"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment', verbose_name='주문')
    
    # 결제 방법
    METHOD_CHOICES = [
        ('card', '신용/체크카드'),
        ('bank', '무통장입금'),
        ('vbank', '가상계좌'),
        ('phone', '휴대폰'),
        ('paypal', 'PayPal'),
    ]
    method = models.CharField('결제 방법', max_length=20, choices=METHOD_CHOICES)
    
    # 결제 상태
    STATUS_CHOICES = [
        ('pending', '대기'),
        ('completed', '완료'),
        ('failed', '실패'),
        ('cancelled', '취소'),
        ('refunded', '환불'),
    ]
    status = models.CharField('결제 상태', max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # 결제 정보
    amount = models.DecimalField('결제 금액', max_digits=10, decimal_places=0)
    transaction_id = models.CharField('거래 ID', max_length=200, blank=True)
    pg_provider = models.CharField('PG사', max_length=50, blank=True)
    
    paid_at = models.DateTimeField('결제일시', null=True, blank=True)
    created_at = models.DateTimeField('생성일', auto_now_add=True)
    
    class Meta:
        verbose_name = '결제'
        verbose_name_plural = '결제 목록'
    
    def __str__(self):
        return f"{self.order.order_number} - {self.get_method_display()}"


class Shipping(models.Model):
    """배송"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='shipping', verbose_name='주문')
    
    carrier = models.CharField('택배사', max_length=50, blank=True)
    tracking_number = models.CharField('운송장 번호', max_length=100, blank=True)
    
    shipped_at = models.DateTimeField('발송일시', null=True, blank=True)
    delivered_at = models.DateTimeField('배송완료일시', null=True, blank=True)
    
    class Meta:
        verbose_name = '배송'
        verbose_name_plural = '배송 목록'
    
    def __str__(self):
        return f"{self.order.order_number} - {self.carrier}"