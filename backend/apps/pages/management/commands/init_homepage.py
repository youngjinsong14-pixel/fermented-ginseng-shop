from django.core.management.base import BaseCommand
from wagtail.models import Site, Page
from apps.pages.models import HomePage


class Command(BaseCommand):
    help = 'Initialize Wagtail homepage'

    def handle(self, *args, **options):
        # Root 페이지 가져오기
        root = Page.get_first_root_node()

        # 기존 홈페이지 찾기
        try:
            home = HomePage.objects.get(slug='home')
            self.stdout.write(self.style.SUCCESS('Found existing homepage!'))
        except HomePage.DoesNotExist:
            # 없으면 새로 만들기
            home = HomePage(
                title="Fermented Ginseng Shop",
                banner_title="Premium 6-Year Red Ginseng",
                banner_subtitle="Your Choice for Healthy Life",
                intro_title="We Promise the Best Quality",
                intro_text="<p>Premium ginseng products made with traditional fermentation techniques</p>",
                slug="home-new",
            )
            root.add_child(instance=home)
            home.save_revision().publish()
            self.stdout.write(self.style.SUCCESS('Created new homepage!'))

        # 사이트에 연결
        site = Site.objects.get(is_default_site=True)
        site.root_page = home
        site.save()

        self.stdout.write(self.style.SUCCESS(f'Success! Homepage ID: {home.id}'))