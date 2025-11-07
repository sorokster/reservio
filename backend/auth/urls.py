from django.urls import path

from backend.auth.views import RegisterView, LoginView, LogoutView, ProfileUpdateView

urlpatterns = [
    path(route='register/', name='register', view=RegisterView.as_view()),
    path(route='login/', name='login', view=LoginView.as_view()),
    path(route='logout/', name='logout', view=LogoutView.as_view()),
    path(route='profile/<int:user_id>/', name='profile-update', view=ProfileUpdateView.as_view()),
]
