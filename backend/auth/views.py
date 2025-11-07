import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from backend.common.decorators import anonymous_required

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    @method_decorator(anonymous_required)
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            user_type = data.get('user_type')

            if User.objects.filter(username=username).exists():
                return JsonResponse({'status': 'error', 'detail': 'Username already exists'}, status=400)

            new_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            # Assign group if valid
            if user_type in ['OWNER', 'WAITER', 'ADMIN']:
                group, created = Group.objects.get_or_create(name=user_type)
                new_user.groups.add(group)

            return JsonResponse({'status': 'success', 'username': new_user.username})

        except Exception as e:
            return JsonResponse({'status': 'error', 'detail': str(e)}, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    @method_decorator(anonymous_required)
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'status': 'success',
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                })
            else:
                return JsonResponse({'status': 'error', 'detail': 'Invalid username or password'}, status=400)

        except Exception as e:
            return JsonResponse({'status': 'error', 'detail': str(e)}, status=400)


class LogoutView(View):
    @staticmethod
    def get(request):
        logout(request)
        return JsonResponse({'status': 'success'})


@method_decorator(csrf_exempt, name='dispatch')
class ProfileUpdateView(View):
    def patch(self, request, user_id):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'detail': 'Authentication required'}, status=401)
        
        if request.user.id != int(user_id):
            return JsonResponse({'status': 'error', 'detail': 'Permission denied'}, status=403)
        
        try:
            data = json.loads(request.body)
            user = request.user
            
            if 'email' in data:
                user.email = data['email']
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            
            user.save()
            
            return JsonResponse({
                'status': 'success',
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            })
        
        except Exception as e:
            return JsonResponse({'status': 'error', 'detail': str(e)}, status=400)