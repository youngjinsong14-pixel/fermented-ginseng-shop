from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, Payment, Shipping

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'get_total']
    inlines = [CartItemInline]
    
    def get_total(self, obj):
        return f"{obj.get_total():,}원"
    get_total.short_description = '총 금액'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'price', 'quantity']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'user__username', 'recipient_name']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('주문 정보', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('배송 정보', {
            'fields': ('recipient_name', 'phone', 'address', 'postal_code', 'delivery_memo')
        }),
        ('금액 정보', {
            'fields': ('subtotal', 'shipping_fee', 'discount', 'total', 'points_used', 'points_earned')
        }),
        ('날짜', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'method', 'status', 'amount', 'paid_at']
    list_filter = ['method', 'status']
    search_fields = ['order__order_number', 'transaction_id']

@admin.register(Shipping)
class ShippingAdmin(admin.ModelAdmin):
    list_display = ['order', 'carrier', 'tracking_number', 'shipped_at', 'delivered_at']
    search_fields = ['order__order_number', 'tracking_number']