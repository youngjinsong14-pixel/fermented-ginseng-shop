from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Payment, Shipping
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_total(self, obj):
        return obj.get_total()

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'price', 'quantity']
        read_only_fields = ['id']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['method', 'status', 'amount', 'transaction_id', 'pg_provider', 'paid_at']
        read_only_fields = ['status', 'paid_at']

class ShippingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipping
        fields = ['carrier', 'tracking_number', 'shipped_at', 'delivered_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    shipping = ShippingSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status',
            'recipient_name', 'phone', 'address', 'postal_code', 'delivery_memo',
            'subtotal', 'shipping_fee', 'discount', 'total',
            'points_used', 'points_earned',
            'items', 'payment', 'shipping',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'user', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'recipient_name', 'phone', 'address', 'postal_code', 'delivery_memo',
            'points_used', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        
        # 주문번호 생성
        import uuid
        order_number = f"ORD-{uuid.uuid4().hex[:12].upper()}"
        
        # 주문 생성
        order = Order.objects.create(
            user=user,
            order_number=order_number,
            **validated_data
        )
        
        # 주문 아이템 생성
        subtotal = 0
        for item_data in items_data:
            from apps.products.models import Product
            product = Product.objects.get(id=item_data['product_id'])
            quantity = item_data['quantity']
            
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                price=product.price,
                quantity=quantity
            )
            subtotal += product.price * quantity
        
        # 금액 계산
        shipping_fee = 0 if subtotal >= 50000 else 3000
        discount = 0
        total = subtotal + shipping_fee - discount - order.points_used
        
        order.subtotal = subtotal
        order.shipping_fee = shipping_fee
        order.discount = discount
        order.total = total
        order.points_earned = int(total * 0.01)  # 1% 적립
        order.save()
        
        return order