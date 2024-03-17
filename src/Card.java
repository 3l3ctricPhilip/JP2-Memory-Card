import javax.swing.*;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;

public class Card extends JLabel implements MouseListener {

    private CardController controller;
    Icon faceIcon;
    Icon backIcon;
    boolean faceUp = false;
    int num;
    int iconWidthHalf, iconHeightHalf;
    boolean mousePressedOnMe = false;

    public Card(CardController controller, Icon faceIcon, Icon backIcon, int num) {
        super(backIcon);
        this.faceIcon = faceIcon;
        this.backIcon = backIcon;
        this.num = num;

        this.addMouseListener(this);
        this.iconHeightHalf = backIcon.getIconHeight() / 2;
        this.iconWidthHalf = faceIcon.getIconWidth() / 2;
        this.controller = controller;
    }

    public int getNum() {
        return num;
    }

    private boolean overIcon(int x, int y) {
        int distX = Math.abs(x - (this.getWidth() / 2));
        int distY = Math.abs(y - (this.getHeight() / 2));

        if (distX > this.iconHeightHalf || distY > this.iconWidthHalf)
            return false;

        return true;
    }

    @Override
    public void mouseClicked(MouseEvent e) {
        if (overIcon(e.getX(), e.getY()))
            this.turnUp();
    }

    private void turnUp() {
        if (this.faceUp) return;
        this.faceUp = true;
        this.faceUp = this.controller.turnUp(this);
        if (this.faceUp) this.setIcon(this.faceIcon);
    }

    public void turnDown() {
        if (!this.faceUp) return;
        this.setIcon(this.backIcon);
        this.faceUp = false;
    }

    @Override
    public void mousePressed(MouseEvent e) {
        if (overIcon(e.getX(), e.getY()))
            this.mousePressedOnMe = true;
    }

    @Override
    public void mouseReleased(MouseEvent e) {
        if (this.mousePressedOnMe) {
            this.mousePressedOnMe = false;
            this.mouseClicked(e);
        }
    }

    @Override
    public void mouseEntered(MouseEvent e) {

    }

    @Override
    public void mouseExited(MouseEvent e) {
        this.mousePressedOnMe = false;
    }
}