from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, OrderItem, Cart, Payment
from .serializers import OrderSerializer, OrderItemSerializer, CartSerializer, PaymentSerializer

class OrderListCreateView(generics.ListCreateAPIView):
    """주문 목록 조회 및 생성"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]  # 누구나 주문 가능
    
    def perform_create(self, serializer):
        # 주문 생성
        order = serializer.save()
        
        # 주문 아이템 생성
        items_data = self.request.data.get('items', [])
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        
        print(f'✅ 주문 생성 완료: 주문번호 {order.id}')
        return order

class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """주문 상세 조회, 수정, 삭제"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

class OrderItemViewSet(viewsets.ModelViewSet):
    """주문 아이템 관리"""
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [AllowAny]

class CartViewSet(viewsets.ModelViewSet):
    """장바구니 관리"""
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """내 장바구니 조회"""
        if request.user.is_authenticated:
            cart_items = Cart.objects.filter(user=request.user)
            serializer = self.get_serializer(cart_items, many=True)
            return Response(serializer.data)
        return Response([])

class PaymentViewSet(viewsets.ModelViewSet):
    """결제 관리"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]