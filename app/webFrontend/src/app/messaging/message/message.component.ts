import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {IMessageDisplay} from '../../../../../../shared/models/messaging/IMessage';
import {MarkdownService} from '../../shared/services/markdown.service';
import {UserService} from '../../shared/services/user.service';
import {DialogService} from '../../shared/services/dialog.service';
import {ShowProgressService} from '../../shared/services/show-progress.service';
import {SnackBarService} from '../../shared/services/snack-bar.service';
import {MessageService} from '../../shared/services/message.service';


@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  @Input() message: IMessageDisplay;
  @Input() messages: IMessageDisplay[];
  @Input() isChildMessage = false;
  @Input() mode: string;
  htmlMessage: any;
  authorId: any;
  showReplies = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private markdownService: MarkdownService,
    private dialogService: DialogService,
    private showProgress: ShowProgressService,
    public  snackBar: SnackBarService,
    private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.htmlMessage = this.sanitizer.bypassSecurityTrustHtml(this.markdownService.render(this.message.content));
  }

  toggleReplies() {
    this.showReplies = !this.showReplies;
  }

  isOwnMessage() {
    return this.userService.user._id === this.message.author;
  }

  deleteMessage() {
    this.dialogService.confirmDelete('message', this.message.content).subscribe(async res => {
      if (!res) {
        return;
      }
      this.showProgress.toggleLoadingGlobal(true);
      const message = this.message;
      try {
        const index = this.messages.indexOf(message);
        this.messages.splice(index, 1);
        await this.messageService.deleteItem(message);
        this.snackBar.open('Message ' + message.content + ' was successfully deleted.');
      } catch (err) {
        this.snackBar.open(err.error.message);
      }

      this.showProgress.toggleLoadingGlobal(false);
    });
  }
}
