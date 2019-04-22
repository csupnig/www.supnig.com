{{{
  "title": "The invisible captcha",
  "tags": ["Web", "Captcha", "UX"],
  "category":"tech",
  "date": "Sun, 03 Jul 2011 17:57:32 GMT",
  "color":"green"
}}}

The following article proposes a solution that can fight most spam bots and makes web forms more usable. The time usually spent on guessing obstructed text fragments will be saved, letting the user focus on the real task: **filling out your form**.
This solution is based on two assumptions:

*   **That most spam bots don't execute javascript**
Now that might not always be true, as there is a variety of browser test swarms out there that could be used to fill out forms, including the ones that use javascript functions.

*   **That most spam bots fill out all the fields they can find**
They probably use this method to extend their reach to forms that contain fields that require an input.
<!--more-->
The following article proposes a solution that can fight most spam bots and makes web forms more usable. The time usually spent on guessing obstructed text fragments will be saved, letting the user focus on the real task: **filling out your form**.
This solution is based on two assumptions:

*   **That most spam bots don't execute javascript**
Now that might not always be true, as there is a variety of browser test swarms out there that could be used to fill out forms, including the ones that use javascript functions.

*   **That most spam bots fill out all the fields they can find**
They probably use this method to extend their reach to forms that contain fields that require an input.
To implement the first assumption we generate a random value that will be set to a form field using a javascript function. To make this part even more secure, you could obfuscate your javascript code so that people looking at the generated code would not see the magic at the first glance.
The second assumption is even easier to implement. We just create a honey pot field, that has to be empty when the form is sent to the server.
We then combine the two methods and randomly alternate the field that will take the generated value and the honey pot field and include them in a hidden container. This container should either be hidden via a display:none directive or just moved out of the view of the user. We would not want to use fields of the type hidden because the possibility is higher that those will not be filled out by spam bots.

**Let us get down to the code:**

We first generate the template for the form containing our invisible captcha. In this example I am using Java in combination with the [velocity template engine](http://velocity.apache.org/).

    <div class="hidden">
      <input type="text" name="$name1" class="$name1" value=""/>
      <input type="text" name="$name2" class="$name2" value=""/>
    </div>
    <script type="text/javascript">
      jQuery(document).ready(function(){jQuery('.$captcha').val('$value');});
    </script>

Then we write the code to populate the template render context and write the random field names as well as the value that we expect to the session. 

    int rnd = randomizer.nextInt(2);
    //GENERATE RANDOM NAMES FOR OUR FIELDS
    String s1 = StringUtil.nextRandomString();
    String s2 = StringUtil.nextRandomString();
    String value = StringUtil.nextRandomString();
    //PUT THE NAMES OF THE FIELDS + THE RANDOM VALUE INTO THE RENDER CONTEXT
    rc.put("name1", s1);
    rc.put("name2", s2);
    rc.put("value", value);
    request.getPortletSession(true).set("captchaValue", value);
    //RANDOMIZE THE POSITION OF THE HONEYPOT AND THE RANDOM VALUE FIELD
    if (rnd == 1) {
      request.getPortletSession(true).set("captcha", s1);
      rc.put("captcha", s1);
      request.getPortletSession(true).set("empty", s2);
    } else {
      request.getPortletSession(true).set("captcha", s2);
      rc.put("captcha", s2);
      request.getPortletSession(true).set("empty", s1);
    }
    
When the form is sent to the server, we have to check the values of the two fields and compare them to the expected values. If the values differ, we most probably dealing with a spam bot or a user that is trying to resend the form by refreshing the document (and we don't want any of those to get through).
When you're not accepting the input it is best to remind the user to not resend the form and/or turn on their javascript with a neat little message.

    //CHECK CAPTCHA
    String captcha = (String) request.getPortletSession(true).get("captcha");
    String empty = (String) request.getPortletSession(true).get("empty");
    String cvalue = (String) request.getPortletSession(true).get("captchaValue");
    
    String sentcvalue = request.getParameter(captcha);
    String sentempty = request.getParameter(empty);
    if (cvalue == null || !cvalue.equals(sentcvalue) || (sentempty != null &amp;&amp; !sentempty.equals(""))) {
      captchaok = false;
      request.getPortletSession(true).set("captchaerror", true);
    }
    //END CHECK CAPTCHA

Now try the whole thing out and leave me a comment! I would be glad to discuss any suggestions or questions.

**Update:**
The idea of not forcing the user to fill out a complicated captcha string found wide adoption in the meantime. The
most popular implementation is probably google's [reCAPTCHA](https://www.google.com/recaptcha/intro/index.html).
I strongly urge you to use their implementation, as they are using a combination of multiple factors to determine
if it is a human filling out the form. Some of these factors are the mouse movements prior to the click on the checkbox,
browser signature, google accounts,...
