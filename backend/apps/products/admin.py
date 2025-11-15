from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_available', 'image_preview', 'created_at']
    list_filter = ['category', 'is_available', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'stock', 'is_available']
    readonly_fields = ['image_preview', 'thumbnail_preview']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('category', 'name', 'slug', 'description')
        }),
        ('가격 및 재고', {
            'fields': ('price', 'stock', 'is_available')
        }),
        ('이미지', {
            'fields': ('image', 'image_preview', 'thumbnail', 'thumbnail_preview')
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="150" height="150" style="object-fit: cover; border-radius: 8px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = '이미지 미리보기'
    
    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 8px;" />',
                obj.thumbnail.url
            )
        return '-'
    thumbnail_preview.short_description = '썸네일 미리보기'