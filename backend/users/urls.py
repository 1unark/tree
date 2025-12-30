from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register, name='register'),  # ← Just 'register/'
    path('login/', views.login, name='login'),            # ← Just 'login/'
    path('logout/', views.logout, name='logout'),         # ← Just 'logout/'
]