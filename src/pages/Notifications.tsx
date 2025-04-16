
import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Check, CheckCheck } from "lucide-react";

const Notifications = () => {
  const { notifications, loading, markAllAsRead, markAsRead } = useNotifications();

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">通知中心</h2>
          <p className="text-muted-foreground">您的所有系统通知</p>
        </div>
        <Button variant="outline" onClick={() => markAllAsRead()} disabled={loading}>
          <CheckCheck className="mr-2 h-4 w-4" />
          全部标为已读
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>通知列表</CardTitle>
          <CardDescription>您的所有通知</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg font-semibold">加载中...</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/60" />
              <p className="mt-4 text-lg font-semibold">暂无通知</p>
              <p className="text-muted-foreground">当有新通知时，会显示在这里</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative rounded-lg border p-4 ${
                    !notification.isRead ? "bg-muted/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex">
                      {!notification.isRead && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          title="标记为已读"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {notification.link && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          onClick={
                            !notification.isRead
                              ? () => markAsRead(notification.id)
                              : undefined
                          }
                        >
                          <Link to={notification.link}>查看详情</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
