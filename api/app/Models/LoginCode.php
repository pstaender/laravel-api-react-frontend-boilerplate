<?php

namespace App\Models;

use App\Notifications\PasswordlessLogin;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class LoginCode extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'valid_until',
        'device_name',
        'user_id',
        'ip',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'valid_until' => 'datetime',
    ];


    public static function createLoginCodeAndNotifyUser(User $user, string $device_name, $ip, $validInMinutes = 5, $codeLength = 6) {
        $code = new self([
            'code' => substr((string) rand(100000,999999), 0, $codeLength),
            'valid_until' => Carbon::now()->addMinutes($validInMinutes),
            'device_name' => $device_name,
            'user_id' => $user->id,
            'ip' => $ip,
        ]);
        $code->save();
        $user->notify(
            new PasswordlessLogin(code: $code->code, validInMinutes: $validInMinutes)
        );
        return $code;
    }

}
