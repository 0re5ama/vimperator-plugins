/*
 * ==VimperatorPlugin==
 * @name            niconicoplaylist_cooperation.js
 * @description     this script give you keyboard opration for NicoNicoPlaylist.
 * @description-ja  NicoNicoPlaylist ���L�[�{�[�h�ő���ł���悤�ɂ���B
 * @author          janus_wel <janus_wel@fb3.so-net.ne.jp>
 * @version         0.20
 * @minversion      1.1
 * ==VimperatorPlugin==
 *
 * CONSTRAINT
 *   need NicoNicoPlaylist version 0.3 or above
 *
 * LICENSE
 *   New BSD License
 *
 * USAGE
 *   :nnppushallvideos
 *     ���݂̃y�[�W���̂��ׂĂ̓�����Đ����X�g�ɑ���B
 *     �����L���O��}�C���X�g�̂ق��A����y�[�W�ł̓I�X�X�����悪�ǉ������B
 *   :nnppushthisvideo
 *     ���݌��Ă��铮����Đ����X�g�ɑ���B
 *   :nnpplaynext [next]
 *     �Đ����X�g�̎��̓�����Đ�����B
 *   :nnpremove [index]
 *     index �Ԗڂ̓�����Đ����X�g�����菜���B index �� 0 ���琔����B
 *     �w�肵�Ȃ��ꍇ�͈�ԏオ��菜�����B
 *   :nnpclear
 *     �Đ����X�g�����ׂăN���A����B
 *   :nnpgetlist [numof]
 *     �Đ����X�g�̏ォ�� numof ��\������B�w�肵�Ȃ��ꍇ�� g:nnp_coop_numoflist ���g����B
 *
 * VARIABLES
 *   g:nnp_coop_numoflist
 *     :NNPGetList �ŕ\�����郊�X�g�̌����w�肷��B�f�t�H���g�� 10 �B
 *
 * HISTORY
 *   2008/07/11 initial written.
 *   2008/07/15 refactoring
 *
 * */
/*
�ȉ��̃R�[�h�� _vimperatorrc �ɓ\��t����ƍK���ɂȂ�邩���B
�R�}���h ( [',nn'] �� [',nr'] �̕��� ) �͓K�X�ς��ĂˁB

javascript <<EOM

// [N],nn
// N �Ԗڂ̓�����Đ�����B
// �w��Ȃ��̏ꍇ���̓��悪�Đ������B
liberator.mappings.addUserMap(
    [liberator.modes.NORMAL],
    [',nn'],
    'play next item in NicoNicoPlaylist',
    function(count) {
        if(count === -1) count = 1;
        liberator.execute(':nnpplaynext ' + count);
    },
    { flags: liberator.Mappings.flags.COUNT }
);

// [N],nr
// �ォ�� N �̓�����폜����B
// �w��Ȃ��̏ꍇ��ԏ�̓��悪�폜�����B
liberator.mappings.addUserMap(
    [liberator.modes.NORMAL],
    [',nr'],
    'remove item in NicoNicoPlaylist',
    function(count) {
        if(count === -1) count = 1;
        for(var i=0 ; i<count ; ++i) liberator.execute(':nnpremove');
        liberator.execute(':nnpgetlist');
    },
    { flags: liberator.Mappings.flags.COUNT }
);

EOM

*/

(function(){

// thumbnail URL
const thumbnailURL = 'http://tn-skr1.smilevideo.jp/smile?i=';

// style
const styles = [
    '<style type="text/css">',
        'table.nnp_coop .index     { text-align:right; width:2em; }',
        'table.nnp_coop .thumbnail { text-align:center; }',
        'table.nnp_coop caption    { color:green; }',
        'table.nnp_coop thead      { text-align:center; }',
    '</style>',
].join('');

// table
const tableTemplate = [
    '<table class="nnp_coop">',
        '$CAPTION',
        '$THEAD',
        '<tbody>$ITEMS</tbody>',
    '</table>',
].join('');

// table caption
const captionTemplate = '<caption>$NUMOFDISPLAY / $NUMOFTOTAL items from NicoNicoPlaylist</caption>';

// table head
const thead = [
    '<thead>',
        '<tr>',
            '<td>&nbsp;</td>',
            '<td>thumbnail</td>',
            '<td>title</td>',
            '<td>url</td>',
        '</tr>',
    '</thead>',
].join('');

// item
const itemHTML = [
    '<tr>',
        '<td class="index">$INDEX:</td>',
        '<td class="thumbnail"><image src="$THUMBNAILURL$ID" width="33" height="25"/></td>',
        '<td>$TITLE</td>',
        '<td>$URL</td>',
    '</tr>',
].join('');


// scrape from div element that inserted by NicoNicoPlaylist
liberator.commands.addUserCommand(['nnpgetlist'], 'get NicoNicoPlaylist',
    function(arg) {
        // check existence of NicoNicoPlaylist
        var playlist = $f('//div[contains(@id, "playlistcontroller_")]');
        if(!playlist) {
            liberator.echoerr('NicoNicoPlaylist is not found.');
            return;
        }

        // check existence of items in NicoNicoPlaylist
        var nodes = $s('div[2]/ul/li/a[2]', playlist);
        var nodesLength = nodes.length
        if(nodesLength === 0) {
            liberator.echoerr('no items in NicoNicoPlaylist.');
            return;
        }

        // get number of displayed items
        var numofList = arg.match(/^\d+$/)
            ? arg
            : (liberator.globalVariables.nnp_coop_numoflist || 10);

        // struct display string
        // generate data
        var items = new Array;
        for(var i=0 ; i<nodesLength && i<numofList ; ++i ) {
            // get video id
            var id = nodes[i].href.match(/\d+$/);
            // evaluate variables and push to list
            items.push(
                itemHTML.replace(/\$INDEX/g,        i + 1)
                        .replace(/\$THUMBNAILURL/g, thumbnailURL)
                        .replace(/\$ID/g,           id)
                        .replace(/\$TITLE/g,        nodes[i].textContent)
                        .replace(/\$URL/g,          nodes[i].href)
            );
        }

        // evaluate variables
        var caption = captionTemplate
            .replace(/\$NUMOFDISPLAY/g, (nodesLength < numofList) ? nodesLength : numofList)
            .replace(/\$NUMOFTOTAL/g,   nodesLength);

        // final processing
        var str = styles + tableTemplate.replace(/\$CAPTION/g, caption)
                                        .replace(/\$THEAD/g,   thead)
                                        .replace(/\$ITEMS/g,   items.join(''));

        liberator.echo(str, liberator.commandline.FORCE_MULTILINE);
    },{}
);

// stuff functions
// return first node
function $f(query, node) {
    node = node || window.content.document;
    var result = (node.ownerDocument || node).evaluate(
        query,
        node,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue ? result.singleNodeValue : null;
}

// return snapshot nodes list
function $s(query, node) {
    node = node || window.content.document;
    var result = (node.ownerDocument || node).evaluate(
        query,
        node,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    var nodes = [];
    for(var i=0 ; i<result.snapshotLength ; ++i) nodes.push(result.snapshotItem(i));
    return nodes;
}

// define other commands
// only send CommandEvent to NicoNicoPlaylist script
[
    [['nnppushallvideos'], "push all videos to NicoNicoPlaylist",    'GMNNPPushAllVideos'],
    [['nnppushthisvideo'], "push current video to NicoNicoPlaylist", 'GMNNPPushThisVideo'],
    [['nnpplaynext'],      "play next in NicoNicoPlaylist",          'GMNNPPlayNext'],
    [['nnpremove'],        "remove item in NicoNicoPlaylist",        'GMNNPRemove'],
    [['nnpclear'],         "clear all items in NicoNicoPlaylist",    'GMNNPClear'],
].forEach(
    function([command, description, eventname]){
        liberator.commands.addUserCommand(command, description,
            function(arg) {
                var r = document.createEvent("CommandEvent");
                r.initCommandEvent(eventname, true, true, arg);
                window.content.dispatchEvent(r);
            },{}
        );
    }
);

})();

// vim:sw=4 ts=4 et:
