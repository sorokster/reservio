from functools import wraps

from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from django.shortcuts import redirect


def anonymous_required(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        # Allow if not authenticated, or if authenticated but session might need refresh
        # This allows re-login to refresh session cookie in browser
        if request.user.is_authenticated:
            # If already authenticated, refresh session and return success
            # This ensures session cookie is set in browser
            request.session.save()
            response = JsonResponse({
                'status': 'success',
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'groups': [group.name for group in request.user.groups.all()],
            })
            return response
        return func(request, *args, **kwargs)
    return wrapper


def group_required(group_name):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('/login/')
            if not request.user.groups.filter(name=group_name).exists():
                raise PermissionDenied(f'You must be in the {group_name} group')
            return func(request, *args, **kwargs)
        return wrapper
    return decorator
