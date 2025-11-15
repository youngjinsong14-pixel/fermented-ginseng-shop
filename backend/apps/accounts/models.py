from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    """사용자 프로필"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile',
        verbose_name='사용자'
    )
    phone = models.CharField('전화번호', max_length=20, blank=True)
    address = models.TextField('주소', blank=True)
    postal_code = models.CharField('우편번호', max_length=10, blank=True)
    
    # 포인트
    points = models.IntegerField('포인트', default=0)
    
    # 등급
    TIER_CHOICES = [
        ('bronze', '브론즈'),
        ('silver', '실버'),
        ('gold', '골드'),
        ('platinum', '플래티넘'),
    ]
    tier = models.CharField('등급', max_length=20, choices=TIER_CHOICES, default='bronze')
    
    # 마케팅 동의
    marketing_agreed = models.BooleanField('마케팅 수신 동의', default=False)
    
    created_at = models.DateTimeField('가입일', auto_now_add=True)
    updated_at = models.DateTimeField('수정일', auto_now=True)
    
    class Meta:
        verbose_name = '사용자 프로필'
        verbose_name_plural = '사용자 프로필 목록'
    
    def __str__(self):
        return f"{self.user.username}의 프로필"
    
    def add_points(self, points):
        """포인트 적립"""
        self.points += points
        self.save()
    
    def use_points(self, points):
        """포인트 사용"""
        if self.points >= points:
            self.points -= points
            self.save()
            return True
        return False


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """사용자 생성 시 자동으로 프로필 생성"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """사용자 저장 시 프로필도 저장"""
    if hasattr(instance, 'profile'):
        instance.profile.save()