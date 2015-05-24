{{{
  "title": "Why are you storing your passwords wrong?",
  "tags": ["security", "passwords", "bcrypt"],
  "category":"tech",
  "date": "Sun, 24 Jun 2012 00:44:01 GMT",
  "color":"green",
  "picture":"/media/pictures/storingpasswordswrong.jpeg"
}}}

The demand for security is getting higher and higher in times where almost everyone with internet access can become a "hacker" of some sort and leaked databases of well known websites and institutions find their way to public file shares. In this article I'm going to describe why and how you should use bcrypt to store your passwords, so that you don't give away all the passwords of your users in case of a stolen database dump.
<!--more-->
Since I started to develop web applications I have seen many different ways of storing passwords. Some of the most disturbing ones are storing the password in plain text, in order to be able to send the password via
email to the user. This might sound like a fairy tale but this is still happening in 2012. There have been several cases like the one of reddit.com (around 2006), where they had to confess that a backup copy of their database was stolen and that it contained all the passwords in clear text.

**The first rule of storing passwords is: Never ever store the actual password!**

You don't need the password in clear text. You should hash the password, store the hash and discard the password. When you want to check the password you just hash it again and compare it against the stored hash.

There are several ways to hash a password. One that I have often seen looks like this:

    $hash = MD5($password);
Don't do this! This is very vulnerable to [rainbow table attacks](http://www.codinghorror.com/blog/2007/09/rainbow-hash-cracking.html). With such an attack it is possible to crack the stored passwords in almost no time.

To counter rainbow table attacks you have to add "salts" to your hash functions in order to make the resulting hash unique. 

    $hash = MD5($salt.$password);
Do not use the same salt for every password! The salt should be randomly generated and stored along with your password. With this method an attacker would have to generate new rainbow tables for each entry. Generating rainbow tables takes time and this will most likely put the attacker off.

In fact you should not use MD5 and its modern competitors (SHA1 and SHA256) to hash passwords. Not only is [MD5 broken](http://cryptocrats.com/crypto/md5-the-hash-algorithm-is-now-broken/), those functions were also designed to be used for checking data in a per-packed / per-message basis where speed is important.

**Speed is exactly what you don't want in a password hash function.**

For example: If your hash function takes twice as long, your users will not mind because they only log in at the beginning of their session. For the attacker on the other hand it would take twice as long to crack the hash.

Good hash functions use a high number of iterations to generate the hash in order to make the computation more costly and therefore safer.

The hash function of choice for storing passwords is bcrypt. It uses Blowfish instead of MD5 which has an expensive setup time and you can even specify the complexity factor that determines the number of iterations that are used to compute the hash. This makes it a perfectly safe function at least until there have been major advances in cryptography. Bcrypt also stores all the information like the salt and the complexity in the resulting hash, keeping you from having to care about extra stuff to store.

Luckily there are very easy to use implementations and libraries out there:

For Java projects I recommend to use jBCrypt ([http://www.mindrot.org/projects/jBCrypt/](http://www.mindrot.org/projects/jBCrypt/))

    // Hash a password for the first time
    String hashed = BCrypt.hashpw(password, BCrypt.gensalt());
    // gensalt's log_rounds parameter determines the complexity
    // the work factor is 2**log_rounds, and the default is 10
    String hashed = BCrypt.hashpw(password, BCrypt.gensalt(12));
    // Check that an unencrypted password matches one that has
    // previously been hashed
    if (BCrypt.checkpw(candidate, hashed))
        System.out.println("It matches");
    else
	    System.out.println("It does not match");
For PHP projects I recommend to use the Portable PHP password hashing framework ([http://www.openwall.com/phpass/](http://www.openwall.com/phpass/))

    require('PasswordHash.php');
    $pwdHasher = new PasswordHash(8, FALSE);
    // $hash is what you would store in your database
    $hash = $pwdHasher->HashPassword( $password );
    // $hash would be the $hashed stored in your database for this user
    $checked = $pwdHasher->CheckPassword($password, $hash);
    if ($checked) {
        echo 'password correct';
    } else {
        echo 'wrong credentials';
    }
Please keep in mind that those are just examples. I am not a cryptographer and if you are working on a high security project you should probably hire one to provide you with the best practices!

Please feel free to discuss in the comments below.