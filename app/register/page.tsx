import { AuthForm } from '@/components/auth-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Регистрация в Lumia
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Создайте новый аккаунт для доступа к чату
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Создание аккаунта</CardTitle>
            <CardDescription>
              Заполните форму для создания нового аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="register">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Зарегистрироваться
              </Button>
            </AuthForm>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Войти
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
