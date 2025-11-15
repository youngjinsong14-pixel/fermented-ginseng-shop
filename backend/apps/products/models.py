from django.db import models

class Category(models.Model):
    """제품 카테고리"""
    name = models.CharField('카테고리명', max_length=100)
    slug = models.SlugField('URL', unique=True)
    description = models.TextField('설명', blank=True)
    created_at = models.DateTimeField('생성일', auto_now_add=True)
    
    class Meta:
        verbose_name = '카테고리'
        verbose_name_plural = '카테고리 목록'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """제품"""
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='카테고리',
        related_name='products'
    )
    name = models.CharField('제품명', max_length=200)
    slug = models.SlugField('URL', unique=True)
    description = models.TextField('상세설명')
    price = models.DecimalField('가격', max_digits=10, decimal_places=0)
    stock = models.IntegerField('재고', default=0)
    is_available = models.BooleanField('판매중', default=True)
    created_at = models.DateTimeField('등록일', auto_now_add=True)
    updated_at = models.DateTimeField('수정일', auto_now=True)
    
    class Meta:
        verbose_name = '제품'
        verbose_name_plural = '제품 목록'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name