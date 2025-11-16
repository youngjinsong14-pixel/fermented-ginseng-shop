from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'items', views.OrderItemViewSet, basename='order-item')
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', views.OrderListCreateView.as_view(), name='order-list'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('', include(router.urls)),
]