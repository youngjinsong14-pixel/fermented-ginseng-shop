import django_filters
from django.db import models
from .models import Product

class ProductFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search', label='검색')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte', label='최소 가격')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte', label='최대 가격')
    category = django_filters.NumberFilter(field_name='category__id', label='카테고리')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock', label='재고 있음')
    ordering = django_filters.OrderingFilter(
        fields=(
            ('created_at', 'latest'),
            ('price', 'price'),
        ),
        label='정렬'
    )
    
    class Meta:
        model = Product
        fields = ['category', 'is_available']
    
    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models.Q(name__icontains=value) | 
            models.Q(description__icontains=value)
        )
    
    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset