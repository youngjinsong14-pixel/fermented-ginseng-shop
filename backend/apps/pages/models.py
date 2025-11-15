from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField
from wagtail.admin.panels import FieldPanel

class HomePage(Page):
    """홈페이지"""
    
    banner_title = models.CharField('배너 제목', max_length=200, default='발효홍삼 건강식품')
    banner_subtitle = models.CharField('배너 부제목', max_length=200, blank=True)
    intro_title = models.CharField('소개 제목', max_length=200, default='프리미엄 6년근 발효홍삼')
    intro_text = RichTextField('소개 내용', blank=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('banner_title'),
        FieldPanel('banner_subtitle'),
        FieldPanel('intro_title'),
        FieldPanel('intro_text'),
    ]
    
    class Meta:
        verbose_name = '홈페이지'
    
    parent_page_types = ['wagtailcore.Page']
    subpage_types = ['pages.NoticePage']


class NoticePage(Page):
    """공지사항 목록 페이지"""
    
    introduction = RichTextField('소개글', blank=True)
    
    content_panels = Page.content_panels + [
        FieldPanel('introduction'),
    ]
    
    class Meta:
        verbose_name = '공지사항 목록'
    
    parent_page_types = ['pages.HomePage']
    subpage_types = ['pages.NoticeDetailPage']


class NoticeDetailPage(Page):
    """공지사항 상세"""
    
    date = models.DateField('공지 날짜')
    author = models.CharField('작성자', max_length=100, default='관리자')
    body = RichTextField('내용')
    is_important = models.BooleanField('중요 공지', default=False)
    
    content_panels = Page.content_panels + [
        FieldPanel('date'),
        FieldPanel('author'),
        FieldPanel('body'),
        FieldPanel('is_important'),
    ]
    
    class Meta:
        verbose_name = '공지사항'
        ordering = ['-date']
    
    parent_page_types = ['pages.NoticePage']
    subpage_types = []