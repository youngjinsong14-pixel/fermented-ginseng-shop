from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, Payment
from .serializers import (
    CartSerializer, CartItemSerializer, 
    OrderSerializer, OrderCreateSerializer,
    PaymentSerializer
)
from apps.products.models import Product

class CartViewSet(viewsets.ModelViewSet):
    """장바구니 API"""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """장바구니에 아이템 추가"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))
        
        product = get_object_or_404(Product, id=product_id)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """장바구니 아이템 수량 변경"""
        cart = Cart.objects.get(user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity'))
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """장바구니 아이템 삭제"""
        cart = Cart.objects.get(user=request.user)
        item_id = request.query_params.get('item_id')
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """장바구니 비우기"""
        cart = Cart.objects.get(user=request.user)
        cart.items.all().delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    """주문 API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # 장바구니 비우기
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart.items.all().delete()
        
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def payment(self, request, pk=None):
        """결제 처리"""
        order = self.get_object()
        
        # 결제 정보 생성
        payment = Payment.objects.create(
            order=order,
            method=request.data.get('method'),
            amount=order.total,
            transaction_id=request.data.get('transaction_id', ''),
            pg_provider=request.data.get('pg_provider', '')
        )
        
        # 결제 완료 처리 (실제로는 PG사 API 연동 필요)
        payment.status = 'completed'
        payment.save()
        
        order.status = 'paid'
        order.save()
        
        # 포인트 적립
        if order.points_earned > 0:
            request.user.profile.add_points(order.points_earned)
        
        return Response(OrderSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """주문 취소"""
        order = self.get_object()
        
        if order.status in ['pending', 'paid']:
            order.status = 'cancelled'
            order.save()
            
            # 포인트 환불
            if order.points_used > 0:
                request.user.profile.add_points(order.points_used)
            
            return Response({'message': '주문이 취소되었습니다.'})
        
        return Response(
            {'error': '취소할 수 없는 상태입니다.'},
            status=status.HTTP_400_BAD_REQUEST
        )