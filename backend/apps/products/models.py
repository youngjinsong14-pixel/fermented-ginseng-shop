from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    price = models.IntegerField()  # ← 여기!
    stock = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)
    
    image = models.ImageField(upload_to='products/%Y/%m/%d/', blank=True, null=True)
    thumbnail = models.ImageField(upload_to='products/thumbnails/%Y/%m/%d/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def category_name(self):
        return self.category.name if self.category else ''
    
    def save(self, *args, **kwargs):
        if self.image:
            from PIL import Image
            from io import BytesIO
            from django.core.files.uploadedfile import InMemoryUploadedFile
            import sys
            
            img = Image.open(self.image)
            
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            output = BytesIO()
            img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            img.save(output, format='JPEG', quality=85)
            output.seek(0)
            
            self.thumbnail = InMemoryUploadedFile(
                output, 'ImageField',
                f"{self.image.name.split('.')[0]}_thumb.jpg",
                'image/jpeg',
                sys.getsizeof(output), None
            )
        
        super().save(*args, **kwargs)