// ==VimperatorPlugin==
// @name           asdfghjkl;
// @description    Inputting numbers by asdfghjkl; keys in hint mode.
// @description-ja Hint$B%b!<%I$G!"(Basdfghjkl;$B%-!<$r;H$C$F?t;zF~NO$r$9$k!#(B
// @license        Creative Commons 2.1 (Attribution + Share Alike)
// @version        1.0
// @author         anekos (anekos@snca.net)
// ==/VimperatorPlugin==
//
// Usage:
//  In hint-mode, When press <Space>, enter into asdfghjkl; mode.
//  (If you want to leave this mode, re-press <Space>)
//
// Usage-ja:
//  $B%R%s%H%b!<%I$G!"(B<Space> $B$r2!$9$H(B asdfghjkl; $B%b!<%I(B(?)$B$KF~$j$^$9!#(B
//  $B=P$?$$>l9g$O!"$b$&0lEY2!$7$^$9!#(B
//
// Links:
//  http://d.hatena.ne.jp/nokturnalmortum/20081021#1224543467
//  

{
  let asdfghjkl_default = eval(liberator.globalVariables.asdfghjkl_default || "false");
  let active = false;

  let original = {
    show: hints.show,
    onEvent: hints.onEvent,
  };

  hints.show = function () {
    active = asdfghjkl_default;
    return original.show.apply(this, arguments);
  };

  hints.onEvent = function (event) {
    let key = events.toString(event);
    if (key == "<Space>") {
      active = !active;
      return;
    }
    if (active && key.length == 1) {
      let n = ";asdfghjkl".indexOf(key);
      if (n >= 0) {
        events.feedkeys(n.toString(), true);
        return;
      }
    }
    return original.onEvent.call(this, event);
  };

}
