from wagtail.models import Site, Page
from apps.pages.models import HomePage

# Root 페이지 가져오기
root = Page.get_first_root_node()

# 기존 홈페이지 찾기
try:
    home = HomePage.objects.get(slug='home')
    print("기존 홈페이지를 찾았습니다!")
except HomePage.DoesNotExist:
    # 없으면 새로 만들기
    home = HomePage(
        title="발효홍삼 쇼핑몰",
        banner_title="프리미엄 6년근 발효홍삼",
        banner_subtitle="건강한 삶을 위한 선택",
        intro_title="최고의 품질을 약속합니다",
        intro_text="<p>전통 발효 기술로 제조한 프리미엄 홍삼 제품</p>",
        slug="home-new",
    )
    root.add_child(instance=home)
    home.save_revision().publish()
    print("새 홈페이지를 만들었습니다!")

# 사이트에 연결
site = Site.objects.get(is_default_site=True)
site.root_page = home
site.save()

print(f"✅ 완료! 홈페이지 ID: {home.id}")